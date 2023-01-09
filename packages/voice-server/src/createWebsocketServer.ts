import { types } from 'mediasoup';
import ws from 'ws';
import { PORT } from './constants';
import { VoiceChannel } from './lib/VoiceChannel';
import { AccordOperation, AccordRTCOperation, WebsocketEvent } from '@accord/common';
import type {
  AccordVoiceWebsocket,
  AccordVoiceWebsocketServer,
  AccordVoicePayloads,
} from '@accord/common';
import { handleWebsocketAuthentication } from './utils/auth/handleWebsocketAuthentication';
import { validateUUID } from './utils/validateUUID';
import { getVoiceChannel } from './utils/db/getVoiceChannel';
import { verifyChannelAuthorisation } from './utils/db/verifyChannelAuthorisation';
import { getDefaultGuildRole } from './utils/db/getDefaultGuildRole';
import { delVoiceChannelState } from './utils/db/delVoiceChannelState';
import { addVoiceChannelState } from './utils/db/addVoiceChannelState';
import { Channel } from 'amqplib';
import { sendToVoiceChannelQueue } from './lib/amqp/sendToVoiceChannelQueue';

export const createWebsocketServer = async (
  worker: types.Worker,
  voiceChannels: Map<string, VoiceChannel>,
  amqpChannel: Channel,
) => {
  const socketServer = new ws.Server({ noServer: false, port: PORT }) as AccordVoiceWebsocketServer;

  socketServer.addListener(WebsocketEvent.CONNECTION, async (client: AccordVoiceWebsocket) => {
    client.id = '';
    client.refreshToken = '';
    client.isAlive = false;
    client.guildId = null;
    client.channelId = null;

    client.on('close', async () => {
      if (client.id && client.channelId) {
        const channel = voiceChannels.get(client.channelId);
        if (channel) {
          await channel.removePeer(client.id);
          if (channel && client.id && client.guildId) {
            sendToVoiceChannelQueue(amqpChannel, {
              op: AccordOperation.VOICE_CHANNEL_STATE_DELETE,
              publishToRoleIds: [channel.defaultGuildRoleId],
              d: { channelId: channel.id, userAccountId: client.id },
            });
            await delVoiceChannelState(client.guildId, channel.id, client.id);
          }
          if (channel.peers.size === 0) {
            voiceChannels.delete(channel.id);
          }
        }
      }
    });

    const authTimeout = setTimeout(() => {
      if (!client.id) {
        client.close(1000, 'AUTH_TIMEOUT');
      }
    }, 15000);

    // This will run every 30 mins, checking the user session is still valid, if not the connection is closed.
    const authInterval = setInterval(() => {
      handleWebsocketAuthentication({ client, refreshToken: client.refreshToken }).then(
        (userId) => {
          if (!userId) {
            client.close(1008, 'INVALID_SESSION');
          }
        },
      );
    }, 1800000);

    const heartbeatInterval = setInterval(() => {
      if (!client.isAlive) {
        return client.close(1002, 'CLIENT_DEAD');
      }
      client.isAlive = false;
      return client.ping();
    }, 30000);

    client.on(WebsocketEvent.PONG, () => {
      client.isAlive = true;
    });

    client.on(WebsocketEvent.CLOSE, async () => {
      clearTimeout(heartbeatInterval);
      clearTimeout(authTimeout);
      clearInterval(authInterval);
    });

    client.onmessage = async ({ data, target }) => {
      if (typeof data !== 'string') {
        return target.close(1007); // Invalid frame payload data
      }

      let payload: AccordVoicePayloads;

      try {
        payload = JSON.parse(data);
      } catch (err) {
        console.error(err);
        return target.close(1007); // Invalid frame payload data
      }

      if ((!client.id || !client.refreshToken) && payload.op !== AccordOperation.AUTHENTICATE_OP) {
        client.send(
          JSON.stringify({
            op: payload.id,
            e: { message: 'NOT_AUTHENTICATED' },
          }),
        );
        return target.close(1008); // Policy Violation
      }

      try {
        switch (payload.op) {
          case AccordOperation.AUTHENTICATE_OP: {
            const userId = await handleWebsocketAuthentication({ client, ...payload.d });

            if (!userId) {
              return client.close(1008, 'NOT_AUTHENTICATED');
            } else {
              client.send(
                JSON.stringify({
                  op: payload.id,
                  d: {
                    success: true,
                  },
                }),
              );
            }

            clearTimeout(authTimeout);
            client.id = userId;
            client.isAlive = true;
            client.refreshToken = payload.d.refreshToken;
            break;
          }
          case AccordRTCOperation.GET_RTP_CAPABILITIES: {
            if (!validateUUID(payload.d.channelId) || !validateUUID(payload.d.guildId)) {
              client.send(JSON.stringify({ op: payload.id, e: { message: 'INVALID_CHANNEL_ID' } }));
              return target.close(1008); // Policy Violation
            }

            const [channel] = await getVoiceChannel(payload.d.guildId, payload.d.channelId);
            if (!channel || channel.type !== 4) {
              client.send(JSON.stringify({ op: payload.id, e: { message: 'INVALID_CHANNEL_ID' } }));
              return target.close(1008); // Policy Violation
            }

            if (!client.id) {
              return;
            }

            const hasChannelAccess = await verifyChannelAuthorisation(
              payload.d.guildId,
              payload.d.channelId,
              client.id,
            );

            if (!hasChannelAccess) {
              client.send(
                JSON.stringify({
                  op: payload.id,
                  e: { message: 'ACCESS_DENIED' },
                }),
              );
              return target.close(1008); // Policy Violation
            }

            client.guildId = payload.d.guildId;
            client.channelId = payload.d.channelId;

            let voiceChannel = voiceChannels.get(payload.d.channelId);

            if (!voiceChannel) {
              const [defaultRole] = await getDefaultGuildRole(payload.d.guildId);
              voiceChannel = new VoiceChannel(
                payload.d.channelId,
                payload.d.guildId,
                defaultRole.id,
                worker,
              );
              voiceChannels.set(payload.d.channelId, voiceChannel);
              await voiceChannel.createRouter();
            }

            voiceChannel.createPeer(client);

            const voiceChannelState = await addVoiceChannelState(
              payload.d.guildId,
              payload.d.channelId,
              client.id,
            );

            sendToVoiceChannelQueue(amqpChannel, {
              op: AccordOperation.VOICE_CHANNEL_STATE_CREATE,
              publishToRoleIds: [voiceChannel.defaultGuildRoleId],
              d: voiceChannelState,
            });

            client.send(
              JSON.stringify({
                op: payload.id,
                d: {
                  rtpCapabilities: voiceChannels.get(payload.d.channelId)?.router.rtpCapabilities,
                },
              }),
            );
            break;
          }
          case AccordRTCOperation.CREATE_TRANSPORT: {
            if (!client.channelId || !client.id) {
              return;
            }
            const voiceChannel = await voiceChannels.get(client.channelId);

            if (!voiceChannel) {
              client.send(
                JSON.stringify({
                  op: payload.id,
                  e: { message: 'CHANNEL_NOT_FOUND' },
                }),
              );
              return target.close(1011); // Internal Error
            }

            const { params } = await voiceChannel.createTransport(client.id);

            client.send(
              JSON.stringify({
                op: payload.id,
                d: {
                  params,
                },
              }),
            );
            break;
          }
          case AccordRTCOperation.CONNECT_TRANSPORT: {
            if (!client.channelId || !client.id) {
              return;
            }
            const voiceChannel = await voiceChannels.get(client.channelId);

            if (!voiceChannel) {
              client.send(
                JSON.stringify({
                  op: payload.id,
                  e: { message: 'CHANNEL_NOT_FOUND' },
                }),
              );
              return target.close(1011); // Internal Error
            }

            voiceChannel.connectTransport(
              client.id,
              payload.d.transportId,
              payload.d.dtlsParameters,
            );

            client.send(JSON.stringify({ op: payload.id }));
            break;
          }

          case AccordRTCOperation.GET_PRODUCERS: {
            if (!client.channelId || !client.id) {
              return;
            }
            const channel = voiceChannels.get(client.channelId);
            if (!channel) {
              break;
            }
            const producerIds = channel.getProducerIds(client.id);
            client.send(JSON.stringify({ op: payload.id, d: { producerIds } }));
            break;
          }

          case AccordRTCOperation.CONSUME: {
            if (!client.channelId || !client.id || !client.guildId) {
              return;
            }
            const { rtpCapabilities, transportId, producerIds } = payload.d;

            const channel = voiceChannels.get(client.channelId);
            if (!channel) {
              client.send(
                JSON.stringify({
                  op: payload.id,
                  e: { message: 'CHANNEL_NOT_FOUND' },
                }),
              );
              return target.close(1011); // Internal Error
            }

            const paramsArray = await Promise.all(
              producerIds.map((id) =>
                channel.consume(client.id!, transportId, id, rtpCapabilities),
              ),
            );

            client.send(
              JSON.stringify({
                op: payload.id,
                d: {
                  paramsArray,
                },
              }),
            );

            break;
          }
          case AccordRTCOperation.PRODUCE: {
            if (!client.channelId || !client.id) {
              return;
            }
            const { kind, rtpParameters } = payload.d;

            const voiceChannel = voiceChannels.get(client.channelId);

            if (!voiceChannel) {
              client.send(
                JSON.stringify({
                  op: payload.id,
                  e: { message: 'CHANNEL_NOT_FOUND' },
                }),
              );
              return target.close(1011); // Internal Error
            }

            const producerId = await voiceChannel.produce(
              client.id,
              payload.d.transportId,
              rtpParameters,
              kind,
            );

            client.send(
              JSON.stringify({
                op: payload.id,
                d: { id: producerId },
              }),
            );

            break;
          }
          case AccordRTCOperation.CONSUMER_RESUME: {
            if (!client.channelId || !client.id || !client.guildId) {
              return;
            }
            if (payload.d.consumerIds.length < 1) {
              client.send(
                JSON.stringify({
                  op: payload.id,
                  e: { message: 'NO_CONSUMER_IDS_FOUND' },
                }),
              );
              return target.close(1002); // Protocol error
            }

            const channel = voiceChannels.get(client.channelId);

            if (!channel) {
              client.send(
                JSON.stringify({
                  op: payload.id,
                  e: { message: 'CHANNEL_NOT_FOUND' },
                }),
              );
              return target.close(1011);
            }

            const peer = channel.peers.get(client.id);

            if (!peer) {
              client.send(
                JSON.stringify({
                  op: payload.id,
                  e: { message: 'PEER_NOT_FOUND' },
                }),
              );
              return target.close(1011);
            }

            await Promise.all(payload.d.consumerIds.map((id) => peer.resumeConsumer(id)));

            client.send(
              JSON.stringify({ op: payload.id, d: { consumerIds: payload.d.consumerIds } }),
            );
            break;
          }
          case AccordRTCOperation.CONSUMER_PAUSE: {
            if (!client.channelId || !client.id || !client.guildId) {
              return;
            }
            if (payload.d.consumerIds.length < 1) {
              client.send(
                JSON.stringify({
                  op: payload.id,
                  e: { message: 'NO_CONSUMER_IDS_FOUND' },
                }),
              );
              return target.close(1002); // Protocol error
            }

            const channel = voiceChannels.get(client.channelId);

            if (!channel) {
              client.send(
                JSON.stringify({
                  op: payload.id,
                  e: { message: 'CHANNEL_NOT_FOUND' },
                }),
              );
              return target.close(1011);
            }

            const peer = channel.peers.get(client.id);

            if (!peer) {
              client.send(
                JSON.stringify({
                  op: payload.id,
                  e: { message: 'PEER_NOT_FOUND' },
                }),
              );
              return target.close(1011);
            }

            await Promise.all(
              payload.d.consumerIds.map((id) => {
                return peer.consumers.get(id)?.pause();
              }),
            );

            client.send(
              JSON.stringify({
                op: payload.id,
                d: { consumerIds: payload.d.consumerIds },
              }),
            );

            break;
          }
          case AccordRTCOperation.PRODUCER_PAUSE: {
            if (!client.channelId || !client.id || !client.guildId) {
              return;
            }
            if (payload.d.producerIds.length < 1) {
              client.send(
                JSON.stringify({
                  op: payload.id,
                  e: { message: 'NO_PRODUCER_IDS_FOUND' },
                }),
              );
              return target.close(1002); // Protocol error
            }

            const channel = voiceChannels.get(client.channelId);

            if (!channel) {
              client.send(
                JSON.stringify({
                  op: payload.id,
                  e: { message: 'CHANNEL_NOT_FOUND' },
                }),
              );
              return target.close(1011);
            }

            const peer = channel.peers.get(client.id);

            if (!peer) {
              client.send(
                JSON.stringify({
                  op: payload.id,
                  e: { message: 'PEER_NOT_FOUND' },
                }),
              );
              return target.close(1011);
            }

            await Promise.all(payload.d.producerIds.map(() => peer.producer?.pause()));

            client.send(
              JSON.stringify({
                op: payload.id,
                d: { producerIds: payload.d.producerIds },
              }),
            );

            sendToVoiceChannelQueue(amqpChannel, {
              op: AccordOperation.VOICE_CHANNEL_STATE_UPDATE,
              publishToRoleIds: [channel.defaultGuildRoleId],
              d: { channelId: channel.id, userAccountId: peer.id, selfMute: true },
            });

            break;
          }
          case AccordRTCOperation.PRODUCER_RESUME: {
            if (!client.channelId || !client.id || !client.guildId) {
              return;
            }
            if (payload.d.producerIds.length < 1) {
              client.send(
                JSON.stringify({
                  op: payload.id,
                  e: { message: 'NO_PRODUCER_IDS_FOUND' },
                }),
              );
              return target.close(1002); // Protocol error
            }

            const channel = voiceChannels.get(client.channelId);

            if (!channel) {
              client.send(
                JSON.stringify({
                  op: payload.id,
                  e: { message: 'CHANNEL_NOT_FOUND' },
                }),
              );
              return target.close(1011);
            }

            const peer = channel.peers.get(client.id);

            if (!peer) {
              client.send(
                JSON.stringify({
                  op: payload.id,
                  e: { message: 'PEER_NOT_FOUND' },
                }),
              );
              return target.close(1011);
            }

            await Promise.all(payload.d.producerIds.map(() => peer.producer?.resume()));

            client.send(
              JSON.stringify({
                op: payload.id,
                d: { producerIds: payload.d.producerIds },
              }),
            );

            sendToVoiceChannelQueue(amqpChannel, {
              op: AccordOperation.VOICE_CHANNEL_STATE_UPDATE,
              publishToRoleIds: [channel.defaultGuildRoleId],
              d: { channelId: channel.id, userAccountId: peer.id, selfMute: false },
            });

            break;
          }
          case AccordRTCOperation.DISCONNECT: {
            const channel = voiceChannels.get(client.channelId ?? '');
            if (channel && client.id && client.guildId) {
              sendToVoiceChannelQueue(amqpChannel, {
                op: AccordOperation.VOICE_CHANNEL_STATE_DELETE,
                publishToRoleIds: [channel.defaultGuildRoleId],
                d: { channelId: channel.id, userAccountId: client.id },
              });
              await delVoiceChannelState(client.guildId, channel.id, client.id);
            }
            client.send(JSON.stringify({ op: payload.id }));
            client.close(1000);
            break;
          }
          default: {
            console.warn('Unknown event - Payload:', payload);
          }
        }
      } catch (e) {
        console.error(e);

        client.send(
          JSON.stringify({
            op: payload.id,
            e: { message: 'UNKNOWN_ERROR' },
          }),
        );

        return client.close(1011);
      }
    };
  });
  socketServer.addListener(WebsocketEvent.LISTENING, () => {
    console.log(`WS Server Listening On Port: ${PORT}`);
  });

  return socketServer;
};
