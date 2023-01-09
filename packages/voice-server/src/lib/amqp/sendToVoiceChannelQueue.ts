import {
  BasePublishEvent,
  RolePublishEvent,
  VoiceChannelStateCreateEvent,
  VoiceChannelStateDeleteEvent,
  VoiceChannelStateUpdateEvent,
  AccordForwardingMessageQueue,
} from '@accord/common';
import { Channel } from 'amqplib';

export const sendToVoiceChannelQueue = (
  channel: Channel,
  payload: BasePublishEvent &
    RolePublishEvent &
    (VoiceChannelStateCreateEvent | VoiceChannelStateDeleteEvent | VoiceChannelStateUpdateEvent),
) => {
  try {
    const buffer = Buffer.from(JSON.stringify(payload));
    channel.assertQueue(AccordForwardingMessageQueue.VOICE_CHANNEL, { durable: false });
    channel.sendToQueue(AccordForwardingMessageQueue.VOICE_CHANNEL, buffer);
    return buffer;
  } catch (e) {
    console.error(e);
    return;
  }
};
