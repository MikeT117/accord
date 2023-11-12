import { ReactNode, useEffect, useState } from 'react';
import { queryClient } from '@/lib/queryClient/queryClient';
import { FullScreenLoadingSpinner } from '@/shared-components/LoadingSpinner';
import { currentUserStore } from '@/shared-stores/currentUserStore';
import { useSessionStore, sessionStore } from '@/shared-stores/sessionStore';
import { voiceStateStore } from '@/shared-stores/voiceStateStore';
import { AccordOperation, WEBSOCKET_ENDPOINT } from '@/constants';
import { guildStore } from '@/shared-stores/guildStore';
import { privateChannelStore } from '@/shared-stores/privateChannelStore';
import { InfiniteData } from '@tanstack/react-query';
import { insertInfiniteDataItem } from '../../lib/queryClient/utils/insertInfiniteDataItem';
import { updateInfiniteDataItem } from '../../lib/queryClient/utils/updateInfiniteDataItem';
import { deleteInfiniteDataItem } from '../../lib/queryClient/utils/deleteInfiniteDataItem';
import { AccordWebsocketClient } from '../../lib/websocketClient/AccordWebsocketClient';
import { IsGuildChannel, IsGuildChannelUpdate } from '../../utils/typeGuards';
import type {
  ChannelCreateEventPayload,
  ChannelMessage,
  ChannelMessageCreateEventPayload,
  ChannelMessageDeleteEventPayload,
  ChannelMessageUpdateEventPayload,
  ChannelPinCreateEventPayload,
  ChannelPinDeleteEventPayload,
  ChannelUpdateEventPayload,
  ClientReadyEventPayload,
  GuildChannelDeleteEventPayload,
  GuildRoleCreateEventPayload,
  GuildRoleDeleteEventPayload,
  GuildRoleUpdateEventPayload,
  UserRelationship,
  UserRelationshipCreateEventPayload,
  UserRelationshipDeleteEventPayload,
  UserRelationshipUpdateEventPayload,
} from '../../types';


export const AccordWebsocket = ({ children }: { children: ReactNode }) => {
  const [ready, set] = useState(false);

  useEffect(() => {
    const awc = new AccordWebsocketClient({
      url: WEBSOCKET_ENDPOINT,
      accesstoken: () => useSessionStore.getState().accesstoken,
      refreshtoken: () => useSessionStore.getState().refreshtoken,
      onError: (ev) => console.error('WS ERROR: ', ev),
      onClose: (ev) => {
        if (ev.reason === 'INVALID_TOKENS') {
          sessionStore.clearSession();
        }
      },
      debug: false,
      reconnect: true,
    });

    awc.addAccordEventListener<ClientReadyEventPayload>(
      AccordOperation.CLIENT_READY_OP,
      ({ guilds, privateChannels, user, voiceChannelStates }) => {
        guildStore.initialise(guilds);
        privateChannelStore.initialise(privateChannels);
        currentUserStore.initialise(user);
        voiceStateStore.initialise(voiceChannelStates);
        set(true);
      },
    );

    // Guild
    awc.addAccordEventListener(AccordOperation.GUILD_CREATE_OP, ({ guild }) => {
      guildStore.createGuild(guild);
    });

    awc.addAccordEventListener(AccordOperation.GUILD_UPDATE_OP, ({ guild }) => {
      guildStore.updateGuild(guild);
    });

    awc.addAccordEventListener(AccordOperation.GUILD_DELETE_OP, ({ guild: { id } }) => {
      guildStore.deleteGuild(id);
    });

    // Guild Roles
    awc.addAccordEventListener<GuildRoleCreateEventPayload>(
      AccordOperation.GUILD_ROLE_CREATE_OP,
      ({ role }) => {
        guildStore.createRole(role);
      },
    );

    awc.addAccordEventListener<GuildRoleUpdateEventPayload>(
      AccordOperation.GUILD_ROLE_UPDATE_OP,
      ({ role }) => {
        guildStore.updateRole(role);
      },
    );

    awc.addAccordEventListener<GuildRoleDeleteEventPayload>(
      AccordOperation.GUILD_ROLE_DELETE_OP,
      ({ role }) => {
        guildStore.deleteRole(role.id, role.guildId);
      },
    );

    // Channels
    awc.addAccordEventListener<ChannelCreateEventPayload>(
      AccordOperation.CHANNEL_CREATE_OP,
      ({ channel }) => {
        if (IsGuildChannel(channel)) {
          guildStore.createChannel(channel);
        } else {
          privateChannelStore.create(channel);
        }
      },
    );

    awc.addAccordEventListener<ChannelUpdateEventPayload>(
      AccordOperation.CHANNEL_UPDATE_OP,
      ({ channel }) => {
        if (IsGuildChannelUpdate(channel)) {
          guildStore.updateChannel(channel);
        } else {
          privateChannelStore.update(channel);
        }
      },
    );

    awc.addAccordEventListener<GuildChannelDeleteEventPayload>(
      AccordOperation.CHANNEL_DELETE_OP,
      ({ id, guildId }) => guildStore.deleteChannel(id, guildId),
    );

    // Channel Messages
    awc.addAccordEventListener<ChannelMessageCreateEventPayload>(
      AccordOperation.CHANNEL_MESSAGE_CREATE_OP,
      ({ message }) => {
        queryClient.setQueryData<InfiniteData<ChannelMessage[]>>(
          [message.channelId, 'messages'],
          (prev) => insertInfiniteDataItem(prev, message),
        );
      },
    );

    awc.addAccordEventListener<ChannelMessageUpdateEventPayload>(
      AccordOperation.CHANNEL_MESSAGE_UPDATE_OP,
      ({ message }) => {
        queryClient.setQueryData<InfiniteData<ChannelMessage[]>>(
          [message.channelId, 'messages'],
          (prev) =>
            updateInfiniteDataItem(prev, (m) => (m.id === message.id ? { ...m, ...message } : m)),
        );
      },
    );

    awc.addAccordEventListener<ChannelMessageDeleteEventPayload>(
      AccordOperation.CHANNEL_MESSAGE_DELETE_OP,
      ({ channelId, id }) => {
        queryClient.setQueryData<InfiniteData<ChannelMessage[]>>([channelId, 'messages'], (prev) =>
          deleteInfiniteDataItem(prev, (m) => m.id !== id),
        );
      },
    );

    // Channel Pins
    awc.addAccordEventListener<ChannelPinCreateEventPayload>(
      AccordOperation.CHANNEL_PIN_CREATE_OP,
      ({ message }) => {
        queryClient.setQueryData<InfiniteData<ChannelMessage[]>>(
          [message.channelId, 'pins'],
          (prev) => insertInfiniteDataItem(prev, message),
        );
      },
    );

    awc.addAccordEventListener<ChannelPinDeleteEventPayload>(
      AccordOperation.CHANNEL_PIN_DELETE_OP,
      ({ channelId, id }) => {
        queryClient.setQueryData<InfiniteData<ChannelMessage[]>>([channelId, 'pins'], (prev) =>
          deleteInfiniteDataItem(prev, (m) => m.id !== id),
        );
      },
    );

    // User Relationships
    awc.addAccordEventListener<UserRelationshipCreateEventPayload>(
      AccordOperation.USER_RELATIONSHIP_UPDATE_OP,
      ({ relationship }) => {
        queryClient.setQueryData<UserRelationship[]>(['relationships'], (prev) =>
          prev
            ? prev.filter((r) => (r.id !== relationship.id ? { ...r, ...relationship } : r))
            : undefined,
        );
      },
    );

    awc.addAccordEventListener<UserRelationshipUpdateEventPayload>(
      AccordOperation.USER_RELATIONSHIP_UPDATE_OP,
      ({ relationship }) => {
        queryClient.setQueryData<UserRelationship[]>(['relationships'], (prev) =>
          prev
            ? prev.filter((r) => (r.id !== relationship.id ? { ...r, ...relationship } : r))
            : undefined,
        );
      },
    );

    awc.addAccordEventListener<UserRelationshipDeleteEventPayload>(
      AccordOperation.USER_RELATIONSHIP_DELETE_OP,
      ({ id }) => {
        queryClient.setQueryData<UserRelationship[]>(['relationships'], (prev) =>
          prev ? prev.filter((r) => r.id !== id) : undefined,
        );
      },
    );

    // Voice Channel States
    // awc.addAccordEventListener(
    //   AccordOperation.VOICE_CHANNEL_STATE_CREATE,
    //   voiceStateStore.addVoiceState,
    // );

    // awc.addAccordEventListener(
    //   AccordOperation.VOICE_CHANNEL_STATE_UPDATE,
    //   voiceStateStore.updateVoiceState,
    // );

    // awc.addAccordEventListener(
    //   AccordOperation.VOICE_CHANNEL_STATE_DELETE,
    //   ({ channelId, userAccountId }) => {
    //     voiceStateStore.delVoiceState(channelId, userAccountId);
    //   },
    // );

    return () => awc.close();
  }, []);

  return ready ? <>{children}</> : <FullScreenLoadingSpinner />;
};
