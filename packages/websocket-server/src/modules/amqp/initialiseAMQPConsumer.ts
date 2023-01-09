import { Channel, Options } from 'amqplib';
import { AccordOperation } from '@accord/common';
import type {
  CombinedPublishEvent,
  AccordWebsocket,
  RolePublishEvent,
  NonPublishedSocketEvents,
  UserPublishEvent,
} from '@accord/common';
import { publishPayload } from '../Websocket/utils/publishPayload';
import { parseAMQPConsumerMessages } from './parseAMQPConsumerMessages';

export const createMessageQueueForwardingConsumer = (
  channel: Channel,
  clients: Set<AccordWebsocket>,
  queue: string,
  consumerOptions: Options.Consume,
) => {
  channel.assertQueue(queue, {
    durable: false,
  });

  channel.consume(
    queue,
    (msg) => {
      const parsed = parseAMQPConsumerMessages<
        RolePublishEvent | UserPublishEvent | CombinedPublishEvent
      >(msg);

      if (!parsed) {
        return;
      }
      publishPayload({ clients, ...parsed });
    },
    consumerOptions,
  );
};

export const createMessageQueueNonForwardingConsumer = (
  channel: Channel,
  clients: Set<AccordWebsocket>,
  queue: string,
  consumerOptions: Options.Consume,
) => {
  channel.assertQueue(queue, {
    durable: false,
  });

  channel.consume(
    queue,
    (msg) => {
      const parsed = parseAMQPConsumerMessages<NonPublishedSocketEvents>(msg);

      if (!parsed) {
        return;
      }

      const { d, op } = parsed;

      switch (op) {
        case AccordOperation.SOCKET_SUBSCRIPTION_ADD:
          for (const client of clients) {
            if (d.userIds.some((r) => r === client.id)) {
              for (const roleId of d.roleIds) {
                client.roles.add(roleId);
              }
            }
          }
          break;
        case AccordOperation.SOCKET_SUBSCRIPTION_REMOVE:
          for (const client of clients) {
            if (d.userIds.some((r) => r === client.id)) {
              for (const roleId of d.roleIds) {
                client.roles.delete(roleId);
              }
            }
          }
          break;
        default:
          break;
      }
    },
    consumerOptions,
  );
};
