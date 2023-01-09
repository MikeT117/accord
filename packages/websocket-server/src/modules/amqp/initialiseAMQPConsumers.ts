import type { Channel } from 'amqplib';
import {
  AccordForwardingMessageQueue,
  AccordNonForwardingMessageQueue,
  AccordWebsocket,
} from '@accord/common';
import {
  createMessageQueueForwardingConsumer,
  createMessageQueueNonForwardingConsumer,
} from './initialiseAMQPConsumer';

export const initialiseAMQPConsumers = async (channel: Channel, clients: Set<AccordWebsocket>) => {
  Object.values(AccordForwardingMessageQueue).forEach((queue) => {
    createMessageQueueForwardingConsumer(channel, clients, queue, { noAck: true });
  });

  Object.values(AccordNonForwardingMessageQueue).forEach((queue) => {
    createMessageQueueNonForwardingConsumer(channel, clients, queue, { noAck: true });
  });
};
