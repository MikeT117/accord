import fp from 'fastify-plugin';
import type {
  BasePublishEvent,
  BasePublishRoleEvent,
  BasePublishUserEvent,
  ChannelCreateEvent,
  ChannelDeleteEvent,
  ChannelMessageCreateEvent,
  ChannelMessageDeleteEvent,
  ChannelMessageUpdateEvent,
  ChannelUpdateEvent,
  GuildDeleteEvent,
  GuildMemberCreateEvent,
  GuildMemberDeleteEvent,
  GuildMemberUpdateEvent,
  GuildRoleCreateEvent,
  GuildRoleDeleteEvent,
  GuildRoleUpdateEvent,
  GuildUpdateEvent,
  PublishedEvents,
  SocketSubscriptionAddEvent,
  SocketSubscriptionRemoveEvent,
  UserRelationshipCreateEvent,
  UserRelationshipDeleteEvent,
  UserRelationshipUpdateEvent,
  UserUpdateEvent,
  GuildCreateEvent,
  ChannelPinCreateEvent,
  ChannelPinDeleteEvent,
} from '@accord/common';
import { AccordForwardingMessageQueue, AccordNonForwardingMessageQueue } from '@accord/common';
import {
  FastifyInstance,
  RawServerDefault,
  FastifyBaseLogger,
  FastifyTypeProviderDefault,
} from 'fastify';
import { IncomingMessage, ServerResponse } from 'http';

function amqpUtils(
  fastify: FastifyInstance<
    RawServerDefault,
    IncomingMessage,
    ServerResponse<IncomingMessage>,
    FastifyBaseLogger,
    FastifyTypeProviderDefault
  >,
) {
  const encodeMessage = (msg: unknown) => {
    try {
      const buffer = Buffer.from(JSON.stringify(msg));
      return buffer;
    } catch (e) {
      fastify.log.error(e);
      return;
    }
  };

  const sendToQueue = (
    queue: string,
    payload: BasePublishEvent &
      Partial<BasePublishUserEvent & BasePublishRoleEvent> &
      PublishedEvents,
  ) => {
    const msg = encodeMessage(payload);
    if (!msg) {
      return false;
    }
    const channel = fastify.amqp.channel;
    channel.assertQueue(queue, { durable: false });
    return channel.sendToQueue(queue, msg);
  };

  const sendToChannelMessageQueue = (
    payload: BasePublishEvent &
      Partial<BasePublishUserEvent & BasePublishRoleEvent> &
      (ChannelMessageCreateEvent | ChannelMessageUpdateEvent | ChannelMessageDeleteEvent),
  ) => sendToQueue(AccordForwardingMessageQueue.CHANNEL_MESSAGE, payload);

  const sendToChannelQueue = (
    payload: BasePublishEvent &
      Partial<BasePublishUserEvent & BasePublishRoleEvent> &
      (ChannelCreateEvent | ChannelDeleteEvent | ChannelUpdateEvent),
  ) => sendToQueue(AccordForwardingMessageQueue.CHANNEL, payload);

  const sendToChannelPinQueue = (
    payload: BasePublishEvent &
      Partial<BasePublishUserEvent & BasePublishRoleEvent> &
      (ChannelPinCreateEvent | ChannelPinDeleteEvent),
  ) => sendToQueue(AccordForwardingMessageQueue.CHANNEL_PIN, payload);

  const sendToUserQueue = (payload: BasePublishEvent & BasePublishUserEvent & UserUpdateEvent) =>
    sendToQueue(AccordForwardingMessageQueue.USER, payload);

  const sendToUserRelationshipQueue = (
    payload: BasePublishEvent &
      BasePublishUserEvent &
      (UserRelationshipCreateEvent | UserRelationshipDeleteEvent | UserRelationshipUpdateEvent),
  ) => sendToQueue(AccordForwardingMessageQueue.USER_RELATIONSHIP, payload);

  const sendToGuildRoleQueue = (
    payload: BasePublishEvent &
      BasePublishRoleEvent &
      (GuildRoleCreateEvent | GuildRoleUpdateEvent | GuildRoleDeleteEvent),
  ) => sendToQueue(AccordForwardingMessageQueue.GUILD_ROLE, payload);

  const sendToGuildQueue = (
    payload: BasePublishEvent &
      Partial<BasePublishUserEvent | BasePublishRoleEvent> &
      (GuildUpdateEvent | GuildDeleteEvent | GuildCreateEvent),
  ) => sendToQueue(AccordForwardingMessageQueue.GUILD, payload);

  const sendToGuildMemberQueue = (
    payload: BasePublishEvent &
      Partial<BasePublishUserEvent | BasePublishRoleEvent> &
      (GuildMemberCreateEvent | GuildMemberUpdateEvent | GuildMemberDeleteEvent),
  ) => sendToQueue(AccordForwardingMessageQueue.GUILD_MEMBER, payload);

  const sendToSocketSessionQueue = (
    payload: BasePublishEvent & (SocketSubscriptionAddEvent | SocketSubscriptionRemoveEvent),
  ) => sendToQueue(AccordNonForwardingMessageQueue.SOCKET_SUBSCRIPTION, payload);

  return {
    sendToChannelMessageQueue,
    sendToChannelQueue,
    sendToChannelPinQueue,
    sendToUserQueue,
    sendToUserRelationshipQueue,
    sendToGuildRoleQueue,
    sendToGuildQueue,
    sendToGuildMemberQueue,
    sendToSocketSessionQueue,
  };
}

export default fp(async (fastify) => {
  const utils = amqpUtils(fastify);
  fastify.decorate('amqpUtils', utils);
});

declare module 'fastify' {
  export interface FastifyInstance {
    amqpUtils: {
      sendToChannelMessageQueue: (
        payload: BasePublishEvent &
          Partial<BasePublishUserEvent & BasePublishRoleEvent> &
          (ChannelMessageCreateEvent | ChannelMessageUpdateEvent | ChannelMessageDeleteEvent),
      ) => boolean | undefined;
      sendToChannelQueue: (
        payload: BasePublishEvent &
          Partial<BasePublishUserEvent & BasePublishRoleEvent> &
          (ChannelCreateEvent | ChannelDeleteEvent | ChannelUpdateEvent),
      ) => boolean | undefined;
      sendToChannelPinQueue: (
        payload: BasePublishEvent &
          Partial<BasePublishUserEvent & BasePublishRoleEvent> &
          (ChannelPinCreateEvent | ChannelPinDeleteEvent),
      ) => boolean | undefined;
      sendToUserQueue: (
        payload: BasePublishEvent & BasePublishUserEvent & UserUpdateEvent,
      ) => boolean | undefined;
      sendToUserRelationshipQueue: (
        payload: BasePublishEvent &
          BasePublishUserEvent &
          (UserRelationshipCreateEvent | UserRelationshipDeleteEvent | UserRelationshipUpdateEvent),
      ) => boolean | undefined;
      sendToGuildRoleQueue: (
        payload: BasePublishEvent &
          BasePublishRoleEvent &
          (GuildRoleCreateEvent | GuildRoleUpdateEvent | GuildRoleDeleteEvent),
      ) => boolean | undefined;
      sendToGuildQueue: (
        payload: BasePublishEvent &
          Partial<BasePublishUserEvent | BasePublishRoleEvent> &
          (GuildUpdateEvent | GuildDeleteEvent | GuildCreateEvent),
      ) => boolean | undefined;
      sendToGuildMemberQueue: (
        payload: BasePublishEvent &
          Partial<BasePublishUserEvent | BasePublishRoleEvent> &
          (GuildMemberCreateEvent | GuildMemberUpdateEvent | GuildMemberDeleteEvent),
      ) => boolean | undefined;
      sendToSocketSessionQueue: (
        payload: BasePublishEvent & (SocketSubscriptionAddEvent | SocketSubscriptionRemoveEvent),
      ) => boolean | undefined;
    };
  }
}
