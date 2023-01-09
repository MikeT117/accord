import { ReactNode, useEffect, useState } from 'react';
import type { ChannelMessage, UserRelationship } from '@accord/common';
import { AccordWebsocketClient } from '@accord/websocket-client';
import { queryClient } from '@/lib/queryClient/queryClient';
import { FullScreenLoadingSpinner } from '@/shared-components/LoadingSpinner';
import { loggedInUserActions } from '@/shared-stores/loggedInUserStore';
import { useSessionStore, sessionStoreActions } from '@/shared-stores/sessionStore';
import { voiceStateActions } from '@/shared-stores/voiceStateStore';
import { AccordOperation } from '@accord/common';
import { WEBSOCKET_ENDPOINT } from '@/constants';
import { guildChannelActions } from '@/shared-stores/guildChannelStore';
import { guildActions } from '@/shared-stores/guildStore';
import { privateChannelActions } from '@/shared-stores/privateChannelStore';
import { InfiniteData } from '@tanstack/react-query';
import { insertInfiniteDataItem } from '../../lib/queryClient/utils/insertInfiniteDataItem';
import { updateInfiniteDataItem } from '../../lib/queryClient/utils/updateInfiniteDataItem';
import { deleteInfiniteDataItem } from '../../lib/queryClient/utils/deleteInfiniteDataItem';

export const AccordWebsocket = ({ children }: { children: ReactNode }) => {
  const [ready, set] = useState(false);

  useEffect(() => {
    const awc = new AccordWebsocketClient({
      url: WEBSOCKET_ENDPOINT,
      refreshToken: () => useSessionStore.getState().refreshtoken,
      onError: (ev) => console.error('WS ERROR: ', ev),
      onClose: (ev) => {
        if (ev.reason === 'UNAUTHENTICATED' || ev.reason === 'INVALID_SESSION') {
          sessionStoreActions.clearSession();
        }
      },
      debug: false,
      reconnect: true,
    });

    awc.addAccordEventListener(
      AccordOperation.CLIENT_READY_OP,
      ({ guildChannels, guilds, privateChannels, user, voiceChannelStates }) => {
        guildActions.initialise(guilds);
        guildChannelActions.initialise(guildChannels);
        privateChannelActions.initialise(privateChannels);
        loggedInUserActions.initialise(user);
        voiceStateActions.initialise(voiceChannelStates);
        set(true);
      },
    );

    awc.addAccordEventListener(AccordOperation.GUILD_CREATE_OP, ({ guild, channels }) => {
      guildActions.addGuild(guild);
      guildChannelActions.addManyChannels(channels);
    });

    awc.addAccordEventListener(AccordOperation.GUILD_UPDATE_OP, ({ guild }) => {
      guildActions.updateGuild(guild);
    });

    awc.addAccordEventListener(AccordOperation.GUILD_DELETE_OP, ({ guild: { id } }) => {
      guildActions.deleteGuild(id);
      guildChannelActions.deleteChannelByGuildId(id);
    });

    awc.addAccordEventListener(AccordOperation.GUILD_ROLE_CREATE_OP, ({ role }) => {
      guildActions.addRole(role);
    });

    awc.addAccordEventListener(AccordOperation.GUILD_ROLE_UPDATE_OP, ({ role }) => {
      guildActions.updateRole(role);
    });

    awc.addAccordEventListener(
      AccordOperation.GUILD_ROLE_DELETE_OP,
      ({ role: { id, guildId } }) => {
        guildActions.deleteRole(id, guildId);
      },
    );

    awc.addAccordEventListener(AccordOperation.GUILD_MEMBER_UPDATE_OP, ({ member }) => {
      guildActions.updateMember(member);
    });

    awc.addAccordEventListener(AccordOperation.CHANNEL_CREATE_OP, ({ channel }) => {
      if (channel.type === 2 || channel.type === 3) {
        privateChannelActions.addChannel(channel);
      } else if (channel.type === 0 || channel.type === 1 || channel.type === 4) {
        guildChannelActions.addChannel(channel);
      }
    });
    awc.addAccordEventListener(AccordOperation.CHANNEL_UPDATE_OP, ({ channel }) => {
      if (channel.type === 2 || channel.type === 3) {
        privateChannelActions.updateChannel(channel);
      } else if (channel.type === 0 || channel.type === 1 || channel.type === 4) {
        guildChannelActions.updateChannel(channel);
      }
    });

    awc.addAccordEventListener(AccordOperation.CHANNEL_DELETE_OP, ({ channel: { id } }) => {
      guildChannelActions.deleteChannel(id);
    });

    awc.addAccordEventListener(
      AccordOperation.VOICE_CHANNEL_STATE_CREATE,
      voiceStateActions.addVoiceState,
    );

    awc.addAccordEventListener(
      AccordOperation.VOICE_CHANNEL_STATE_UPDATE,
      voiceStateActions.updateVoiceState,
    );

    awc.addAccordEventListener(
      AccordOperation.VOICE_CHANNEL_STATE_DELETE,
      ({ channelId, userAccountId }) => {
        voiceStateActions.delVoiceState(channelId, userAccountId);
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
      loggedInUserActions.updateUser(user);
    });

    return () => awc.close();
  }, []);

  return ready ? <>{children}</> : <FullScreenLoadingSpinner />;
};
