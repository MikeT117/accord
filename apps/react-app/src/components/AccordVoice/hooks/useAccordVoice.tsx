import { AccordRTCOperation } from '@accord/common';
import { AccordWebsocketClient } from '@accord/websocket-client';
import { Device } from 'mediasoup-client';
import type { Producer } from 'mediasoup-client/lib/Producer';
import type { RtpCapabilities } from 'mediasoup-client/lib/RtpParameters';
import type { Transport, TransportOptions } from 'mediasoup-client/lib/Transport';
import { memo, useCallback, useMemo, useRef } from 'react';
import type { Consumer } from 'mediasoup-client/lib/Consumer';
import { useSessionStore } from '@/shared-stores/sessionStore';
import { voiceStateActions } from '@/shared-stores/voiceStateStore';
import { RTC_WEBSOCKET_ENDPOINT } from '@/constants';
import { toastActions } from '@/shared-components/Toast';
import { useLoggedInUserId } from '../../../shared-stores/loggedInUserStore';

const webRtcState: {
  guildId: string | null;
  channelId: string | null;
  ws: AccordWebsocketClient | null;
  mediaDevice: Device | null;
  rtpCapabilities: RtpCapabilities | null;
  sendTransport: Transport | null;
  recvTransport: Transport | null;
  mediaProducer: Producer | null;
  mediaConsumers: Map<string, Consumer>;
  producerIds: string[];
  mediaTracks: MediaStreamTrack[];
  params: TransportOptions | null;
} = {
  guildId: null,
  channelId: null,
  ws: null,
  mediaDevice: null,
  rtpCapabilities: null,
  sendTransport: null,
  recvTransport: null,
  mediaProducer: null,
  mediaConsumers: new Map(),
  producerIds: [],
  mediaTracks: [],
  params: null,
};

export const useAccordVoice = () => {
  const userId = useLoggedInUserId();
  const audioElemRef = useRef<HTMLAudioElement>(null);

  const getRtpCapabilities = useCallback((guildId: string, channelId: string) => {
    return new Promise<void>((resolve, reject) => {
      if (!webRtcState.ws) {
        return reject(Error('Websocket connection not established'));
      }
      webRtcState.guildId = guildId;
      webRtcState.channelId = channelId;
      webRtcState.ws.emit({
        op: AccordRTCOperation.GET_RTP_CAPABILITIES,
        d: { guildId, channelId },
        callback: ({ rtpCapabilities }) => {
          webRtcState.rtpCapabilities = rtpCapabilities;
          resolve();
        },
      });
    });
  }, []);

  const createDevice = useCallback(async () => {
    if (!webRtcState.rtpCapabilities) {
      throw new Error('Invalid RtpCapabilities');
    }
    try {
      const device = new Device();
      await device.load({ routerRtpCapabilities: webRtcState.rtpCapabilities });
      webRtcState.mediaDevice = device;
    } catch (e) {
      throw new Error('Could not create MediaDevice');
    }
  }, []);

  const getProducers = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      if (!webRtcState.ws) {
        return reject(Error('Websocket connection not established'));
      }
      webRtcState.ws.emit({
        op: AccordRTCOperation.GET_PRODUCERS,
        callback: ({ producerIds }) => {
          webRtcState.producerIds = producerIds;
          resolve();
        },
      });
    });
  }, []);

  const createTransport = useCallback(({ isProducer }: { isProducer: boolean }) => {
    return new Promise<void>((resolve, reject) => {
      if (!webRtcState.ws) {
        return reject(Error('Websocket connection not established'));
      }
      if (!webRtcState.mediaDevice) {
        reject(Error('MediaDevice not found'));
      }
      if ((isProducer && webRtcState.sendTransport) || (!isProducer && webRtcState.recvTransport)) {
        return;
      }
      webRtcState.ws.emit({
        op: AccordRTCOperation.CREATE_TRANSPORT,
        callback: ({ params }) => {
          if (!webRtcState.mediaDevice) {
            return reject(Error('MediaDevice not found'));
          }
          const transport = isProducer
            ? webRtcState.mediaDevice.createSendTransport(params)
            : webRtcState.mediaDevice.createRecvTransport(params);

          if (!transport) {
            return reject(Error('Could not create WebRTC transport'));
          }
          transport.on('connect', ({ dtlsParameters }, cb) => {
            webRtcState.ws?.emit({
              op: AccordRTCOperation.CONNECT_TRANSPORT,
              d: { dtlsParameters, transportId: transport.id },
              callback: () => {
                cb();
              },
            });
          });
          if (isProducer) {
            transport.on('produce', async (parameters, cb) => {
              webRtcState.ws?.emit({
                op: AccordRTCOperation.PRODUCE,
                d: {
                  kind: parameters.kind,
                  rtpParameters: parameters.rtpParameters,
                  transportId: transport.id,
                },
                callback({ id }) {
                  cb({ id });
                },
              });
            });
            webRtcState.sendTransport = transport;
          } else {
            webRtcState.recvTransport = transport;
          }
          resolve();
        },
      });
    });
  }, []);

  const produce = useCallback(async () => {
    if (!webRtcState.sendTransport) {
      throw new Error('WebRTC transport not found');
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
    } catch (e) {
      throw new Error('Mic not found');
    }

    const track = stream.getAudioTracks()[0];
    const producer = await webRtcState.sendTransport.produce({ track });

    producer.observer.on('pause', () => {
      if (webRtcState.channelId) {
        voiceStateActions.setSelfMute(webRtcState.channelId, userId, true);
      }
    });

    producer.observer.on('resume', () => {
      if (webRtcState.channelId) {
        voiceStateActions.setSelfMute(webRtcState.channelId, userId, false);
      }
    });

    webRtcState.mediaProducer = producer;
  }, [userId]);

  const consume = useCallback((producerId?: string) => {
    return new Promise<Consumer[]>((resolve, reject) => {
      if (!webRtcState.ws) {
        return reject(Error('Websocket connection has not been established'));
      }
      if (!webRtcState.mediaDevice) {
        return reject(Error('MediaDevice not found'));
      }
      if (!webRtcState.recvTransport) {
        return reject(Error('WebRTC transport not found'));
      }
      if (webRtcState.producerIds.length < 1 && !producerId) {
        return;
      }
      webRtcState.ws.emit({
        op: AccordRTCOperation.CONSUME,
        d: {
          rtpCapabilities: webRtcState.mediaDevice.rtpCapabilities,
          producerIds: producerId ? [producerId] : webRtcState.producerIds,
          transportId: webRtcState.recvTransport.id,
        },
        callback: async ({ paramsArray }) => {
          await Promise.all(
            paramsArray.map(async (params) => {
              if (!webRtcState.recvTransport) {
                throw new Error('WebRTC transport not found');
              }
              const consumer = await webRtcState.recvTransport.consume({
                id: params.id,
                producerId: params.producerId,
                kind: params.kind,
                rtpParameters: params.rtpParameters,
              });

              consumer.observer.on('pause', () => {
                if (webRtcState.channelId) {
                  voiceStateActions.setMute(webRtcState.channelId, params.userId, true);
                }
              });
              consumer.observer.on('resume', () => {
                if (webRtcState.channelId) {
                  voiceStateActions.setMute(webRtcState.channelId, params.userId, false);
                }
              });

              webRtcState.mediaConsumers.set(params.userId, consumer);
            }),
          );

          webRtcState.mediaConsumers.forEach((mediaConsumer) => {
            webRtcState.mediaTracks.push(mediaConsumer.track);
          });

          if (!audioElemRef.current) {
            return reject(Error('Audio element not found'));
          } else {
            audioElemRef.current.srcObject = new MediaStream(webRtcState.mediaTracks);
          }
          resolve(Array.from(webRtcState.mediaConsumers.values()));
        },
      });
    });
  }, []);

  const resumeConsumers = useCallback((consumerIds?: string[]) => {
    if (!webRtcState.ws || !webRtcState.recvTransport || webRtcState.mediaConsumers.size === 0) {
      throw new Error('Websocket connection has not been established');
    }

    if (webRtcState.mediaTracks.length === 0) {
      return;
    }

    webRtcState.ws.emit({
      op: AccordRTCOperation.CONSUMER_RESUME,
      d: {
        consumerIds: Array.isArray(consumerIds)
          ? consumerIds
          : Array.from(webRtcState.mediaConsumers.values()).map((c) => c.id),
      },
    });
  }, []);

  const pauseResumeProducer = useCallback(async () => {
    const mediaProducer = webRtcState.mediaProducer;
    if (!mediaProducer || !webRtcState.ws || !webRtcState.channelId) {
      return;
    }

    webRtcState.ws.emit({
      op: mediaProducer.paused
        ? AccordRTCOperation.PRODUCER_RESUME
        : AccordRTCOperation.PRODUCER_PAUSE,
      d: { producerIds: [mediaProducer.id] },
      callback: () => {
        if (mediaProducer.paused) {
          mediaProducer.resume();
        } else {
          mediaProducer.pause();
        }
      },
    });
  }, []);

  const pauseResumeConsumer = useCallback(async (consumerUserId: string) => {
    const consumer = webRtcState.mediaConsumers.get(consumerUserId);
    if (!consumer || !webRtcState.ws || !webRtcState.channelId) {
      return;
    }

    webRtcState.ws.emit({
      op: consumer.paused ? AccordRTCOperation.CONSUMER_RESUME : AccordRTCOperation.CONSUMER_PAUSE,
      d: { consumerIds: [consumer.id] },
      callback: () => {
        if (consumer.paused) {
          consumer.resume();
        } else {
          consumer.pause();
        }
      },
    });
  }, []);

  const connectWs = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      if (webRtcState.ws && webRtcState.ws.readyState === webRtcState.ws.OPEN) {
        webRtcState.ws.close();
      }
      const socket = new AccordWebsocketClient({
        url: RTC_WEBSOCKET_ENDPOINT,
        refreshToken: () => useSessionStore.getState().refreshtoken,
        onAuthenticationSuccessHandler: () => {
          webRtcState.ws = socket;
          resolve();
        },
      });

      socket.addAccordEventListener(AccordRTCOperation.PRODUCER_JOINED, async (data) => {
        if (!webRtcState.mediaDevice || !webRtcState.recvTransport) {
          return reject(Error('WebRTC transport not found'));
        }
        const consumers = await consume(data.producerId);
        resumeConsumers(consumers.map((c) => c.id));
      });
    });
  }, [consume, resumeConsumers]);

  const leaveVoiceChannel = useCallback(async () => {
    webRtcState.ws?.emit({
      op: AccordRTCOperation.DISCONNECT,
      d: {},
      callback: () => {
        if (webRtcState.channelId) {
          voiceStateActions.delVoiceState(webRtcState.channelId, userId);
          webRtcState.sendTransport?.close();
          webRtcState.recvTransport?.close();
          webRtcState.guildId = null;
          webRtcState.channelId = null;
          webRtcState.ws = null;
          webRtcState.mediaDevice = null;
          webRtcState.rtpCapabilities = null;
          webRtcState.sendTransport = null;
          webRtcState.recvTransport = null;
          webRtcState.mediaProducer = null;
          webRtcState.mediaConsumers = new Map();
          webRtcState.producerIds = [];
          webRtcState.mediaTracks = [];
          webRtcState.params = null;
        }
      },
    });
  }, [userId]);

  const joinVoiceChannel = useCallback(
    async (guildId: string, channelId: string) => {
      try {
        await connectWs();
        await getRtpCapabilities(guildId, channelId);
        await createDevice();

        await createTransport({ isProducer: true });
        await produce();

        await createTransport({ isProducer: false });
        await getProducers();

        await consume();
        resumeConsumers();
      } catch (e) {
        toastActions.addToast({
          title: 'Could not join Voice Channel',
          description: (e as Error).message,
          type: 'ERROR',
          duration: Infinity,
        });
        leaveVoiceChannel();
      }
    },
    [
      connectWs,
      getRtpCapabilities,
      createDevice,
      createTransport,
      produce,
      getProducers,
      consume,
      resumeConsumers,
      leaveVoiceChannel,
    ],
  );

  const AccordAudio = memo(() => <audio ref={audioElemRef} autoPlay />);
  AccordAudio.displayName = 'AccordAudio';

  return {
    currentUserId: userId,
    joinVoiceChannel,
    leaveVoiceChannel,
    pauseResumeConsumer,
    pauseResumeProducer,
    AccordAudio,
  };
};
