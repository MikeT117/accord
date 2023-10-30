import { ReactNode, useEffect, useState } from 'react';
import type { ChannelMessage, UserRelationship } from '@accord/common';
import { AccordWebsocketClient } from '@accord/websocket-client';
import { queryClient } from '@/lib/queryClient/queryClient';
import { FullScreenLoadingSpinner } from '@/shared-components/LoadingSpinner';
import { currentUserStore } from '@/shared-stores/currentUserStore';
import { useSessionStore, sessionStore } from '@/shared-stores/sessionStore';
import { voiceStateStore } from '@/shared-stores/voiceStateStore';
import { AccordOperation } from '@accord/common';
import { WEBSOCKET_ENDPOINT } from '@/constants';
import { guildStore } from '@/shared-stores/guildStore';
import { privateChannelStore } from '@/shared-stores/privateChannelStore';
import { InfiniteData } from '@tanstack/react-query';
import { insertInfiniteDataItem } from '../../lib/queryClient/utils/insertInfiniteDataItem';
import { updateInfiniteDataItem } from '../../lib/queryClient/utils/updateInfiniteDataItem';
import { deleteInfiniteDataItem } from '../../lib/queryClient/utils/deleteInfiniteDataItem';

export const AccordWebsocket = ({ children }: { children: ReactNode }) => {
  const [ready, set] = useState(false);

  useEffect(() => {
    const awc = new AccordWebsocketClient({
      url: WEBSOCKET_ENDPOINT,
      accesstoken: () => useSessionStore.getState().accesstoken,
      refreshtoken: () => useSessionStore.getState().refreshtoken,
      onError: (ev) => console.error('WS ERROR: ', ev),
      onClose: (ev) => {
        if (ev.reason === 'UNAUTHENTICATED' || ev.reason === 'INVALID_SESSION') {
          sessionStore.clearSession();
        }
      },
      debug: false,
      reconnect: true,
    });

    awc.addAccordEventListener(
      AccordOperation.CLIENT_READY_OP,
      ({ guilds, privateChannels, user, voiceChannelStates }) => {
        guildStore.initialise(guilds);
        privateChannelStore.initialise(privateChannels);
        currentUserStore.initialise(user);
        voiceStateStore.initialise(voiceChannelStates);
        set(true);
      },
    );

    awc.addAccordEventListener(AccordOperation.GUILD_CREATE_OP, ({ guild }) => {
      guildStore.createGuild(guild);
    });

    awc.addAccordEventListener(AccordOperation.GUILD_UPDATE_OP, ({ guild }) => {
      guildStore.updateGuild(guild);
    });

    awc.addAccordEventListener(AccordOperation.GUILD_DELETE_OP, ({ guild: { id } }) => {
      guildStore.deleteGuild(id);
    });

    awc.addAccordEventListener(AccordOperation.GUILD_ROLE_CREATE_OP, ({ role }) => {
      guildStore.createRole(role);
    });

    awc.addAccordEventListener(AccordOperation.GUILD_ROLE_UPDATE_OP, ({ role }) => {
      guildStore.updateRole(role);
    });

    awc.addAccordEventListener(AccordOperation.GUILD_ROLE_DELETE_OP, ({ role }) => {
      guildStore.deleteRole(role.id, role.guildId);
    });

    awc.addAccordEventListener(AccordOperation.GUILD_MEMBER_UPDATE_OP, ({ member }) => {
      guildStore.updateMember(member);
    });

    awc.addAccordEventListener(AccordOperation.CHANNEL_CREATE_OP, ({ channel }) => {
      guildStore.createChannel(channel);
    });

    awc.addAccordEventListener(AccordOperation.CHANNEL_UPDATE_OP, ({ channel }) => {
      guildStore.updateChannel(channel);
    });

    awc.addAccordEventListener(
      AccordOperation.CHANNEL_DELETE_OP,
      ({ channel: { id, guildId } }) => {
        guildStore.deleteChannel(id, guildId);
      },
    );

    awc.addAccordEventListener(
      AccordOperation.VOICE_CHANNEL_STATE_CREATE,
      voiceStateStore.addVoiceState,
    );

    awc.addAccordEventListener(
      AccordOperation.VOICE_CHANNEL_STATE_UPDATE,
      voiceStateStore.updateVoiceState,
    );

    awc.addAccordEventListener(
      AccordOperation.VOICE_CHANNEL_STATE_DELETE,
      ({ channelId, userAccountId }) => {
        voiceStateStore.delVoiceState(channelId, userAccountId);
      },
    );

    awc.addAccordEventListener(AccordOperation.CHANNEL_MESSAGE_CREATE_OP, ({ message }) => {
      queryClient.setQueryData<InfiniteData<ChannelMessage[]>>(
        [message.channelId, 'messages'],
        (prev) => insertInfiniteDataItem(prev, message),
      );
    });

    awc.addAccordEventListener(AccordOperation.CHANNEL_MESSAGE_UPDATE_OP, ({ message }) => {
      queryClient.setQueryData<InfiniteData<ChannelMessage[]>>(
        [message.channelId, 'messages'],
        (prev) =>
          updateInfiniteDataItem(prev, (m) => (m.id === message.id ? { ...m, ...message } : m)),
      );
    });

    awc.addAccordEventListener(AccordOperation.CHANNEL_MESSAGE_DELETE_OP, ({ message }) => {
      queryClient.setQueryData<InfiniteData<ChannelMessage[]>>(
        [message.channelId, 'messages'],
        (prev) => deleteInfiniteDataItem(prev, (m) => m.id !== message.id),
      );
    });

    awc.addAccordEventListener(AccordOperation.CHANNEL_PIN_CREATE_OP, ({ message }) => {
      queryClient.setQueryData<InfiniteData<ChannelMessage[]>>(
        [message.channelId, 'messages', 'pinned'],
        (prev) => insertInfiniteDataItem(prev, message),
      );
    });

    awc.addAccordEventListener(AccordOperation.CHANNEL_PIN_DELETE_OP, ({ message }) => {
      queryClient.setQueryData<InfiniteData<ChannelMessage[]>>(
        [message.channelId, 'messages', 'pinned'],
        (prev) => deleteInfiniteDataItem(prev, (m) => m.id !== message.id),
      );
    });

    awc.addAccordEventListener(AccordOperation.USER_RELATIONSHIP_UPDATE_OP, ({ relationship }) => {
      queryClient.setQueryData<UserRelationship[]>(['relationships'], (prev) =>
        prev
          ? prev.filter((r) => (r.id !== relationship.id ? { ...r, ...relationship } : r))
          : undefined,
      );
    });

    awc.addAccordEventListener(AccordOperation.USER_UPDATE, ({ user }) => {
      currentUserStore.updateUser(user);
    });

    return () => awc.close();
  }, []);

  return ready ? <>{children}</> : <FullScreenLoadingSpinner />;
};
