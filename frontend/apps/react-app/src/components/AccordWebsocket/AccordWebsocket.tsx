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
    ChannelMessage,
    ClientReadyEventPayload,
    Guild,
    GuildChannel,
    GuildRole,
    PrivateChannel,
    UserRelationship,
    VoiceChannelState,
} from '../../types';

export const AccordWebsocket = ({ children }: { children: ReactNode }) => {
    const [ready, set] = useState(false);

    useEffect(() => {
        const awc = new AccordWebsocketClient({
            url: WEBSOCKET_ENDPOINT,
            identifyPayload: () => ({
                accesstoken: useSessionStore.getState().accesstoken.split(' ')[1],
                refreshtoken: useSessionStore.getState().refreshtoken,
            }),
            onError: (ev) => console.error('WS ERROR: ', ev),
            onClose: (ev) => {
                if (ev.reason === 'INVALID_TOKENS') {
                    sessionStore.clearSession();
                }
            },
            debug: true,
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
        awc.addAccordEventListener<Guild>(AccordOperation.GUILD_CREATE_OP, (guild) => {
            guildStore.createGuild(guild);
        });

        awc.addAccordEventListener<Omit<Guild, 'channels' | 'members' | 'roles'>>(
            AccordOperation.GUILD_UPDATE_OP,
            (guild) => {
                guildStore.updateGuild(guild);
            },
        );

        awc.addAccordEventListener<string>(AccordOperation.GUILD_DELETE_OP, (id) => {
            guildStore.deleteGuild(id);
        });

        // Guild Roles
        awc.addAccordEventListener<GuildRole>(AccordOperation.GUILD_ROLE_CREATE_OP, (role) => {
            guildStore.createRole(role);
        });

        awc.addAccordEventListener<GuildRole>(AccordOperation.GUILD_ROLE_UPDATE_OP, (role) => {
            guildStore.updateRole(role);
        });

        awc.addAccordEventListener<Pick<GuildRole, 'id' | 'guildId'>>(
            AccordOperation.GUILD_ROLE_DELETE_OP,
            ({ id, guildId }) => {
                guildStore.deleteRole(id, guildId);
            },
        );

        awc.addAccordEventListener<{ guildId: string; roleId: string }>(
            AccordOperation.GUILD_ROLE_MEMBER_CREATE_OP,
            ({ roleId, guildId }) => {
                guildStore.addGuildRoleMember(guildId, roleId);
            },
        );

        awc.addAccordEventListener<{ guildId: string; roleId: string }>(
            AccordOperation.GUILD_ROLE_MEMBER_DELETE_OP,
            ({ roleId, guildId }) => {
                guildStore.delGuildRoleMember(guildId, roleId);
            },
        );

        // Channels
        awc.addAccordEventListener<GuildChannel | PrivateChannel>(
            AccordOperation.CHANNEL_CREATE_OP,
            (channel) => {
                if (IsGuildChannel(channel)) {
                    guildStore.createChannel(channel);
                } else {
                    privateChannelStore.create(channel);
                }
            },
        );

        awc.addAccordEventListener<
            | (Pick<GuildChannel, 'id' | 'guildId'> & Partial<Omit<GuildChannel, 'id' | 'guildId'>>)
            | (Pick<PrivateChannel, 'id'> & Partial<Omit<PrivateChannel, 'id'>>)
        >(AccordOperation.CHANNEL_UPDATE_OP, (channel) => {
            if (IsGuildChannelUpdate(channel)) {
                guildStore.updateChannel(channel);
            } else {
                privateChannelStore.update(channel);
            }
        });

        awc.addAccordEventListener<{ id: string; guildId: string }>(
            AccordOperation.CHANNEL_DELETE_OP,
            ({ id, guildId }) => guildStore.deleteChannel(id, guildId),
        );

        // Channel Messages
        awc.addAccordEventListener<ChannelMessage>(
            AccordOperation.CHANNEL_MESSAGE_CREATE_OP,
            (message) => {
                queryClient.setQueryData<InfiniteData<ChannelMessage[]>>(
                    [message.channelId, 'messages'],
                    (prev) => insertInfiniteDataItem(prev, message),
                );
            },
        );

        awc.addAccordEventListener<ChannelMessage>(
            AccordOperation.CHANNEL_MESSAGE_UPDATE_OP,
            (message) => {
                queryClient.setQueryData<InfiniteData<ChannelMessage[]>>(
                    [message.channelId, 'messages'],
                    (prev) =>
                        updateInfiniteDataItem(prev, (m) =>
                            m.id === message.id ? { ...m, ...message } : m,
                        ),
                );
            },
        );

        awc.addAccordEventListener<{ id: string; channelId: string }>(
            AccordOperation.CHANNEL_MESSAGE_DELETE_OP,
            ({ channelId, id }) => {
                queryClient.setQueryData<InfiniteData<ChannelMessage[]>>(
                    [channelId, 'messages'],
                    (prev) => deleteInfiniteDataItem(prev, (m) => m.id !== id),
                );
            },
        );

        // Channel Pins
        awc.addAccordEventListener<string>(AccordOperation.CHANNEL_PINS_UPDATE_OP, (channelId) => {
            queryClient.invalidateQueries({ queryKey: [channelId, 'pins'] });
        });

        // User Relationships
        awc.addAccordEventListener<UserRelationship>(
            AccordOperation.USER_RELATIONSHIP_CREATE_OP,
            (relationship) => {
                queryClient.setQueryData<UserRelationship[]>(['relationships'], (prev) =>
                    prev ? [...prev, relationship] : undefined,
                );
            },
        );

        awc.addAccordEventListener<Pick<UserRelationship, 'id' | 'status'>>(
            AccordOperation.USER_RELATIONSHIP_UPDATE_OP,
            (relationship) => {
                queryClient.setQueryData<UserRelationship[]>(['relationships'], (prev) =>
                    prev
                        ? prev.map((r) =>
                              r.id === relationship.id ? { ...r, ...relationship } : r,
                          )
                        : undefined,
                );
            },
        );

        awc.addAccordEventListener<{ id: string }>(
            AccordOperation.USER_RELATIONSHIP_DELETE_OP,
            ({ id }) => {
                queryClient.setQueryData<UserRelationship[]>(['relationships'], (prev) =>
                    prev ? prev.filter((r) => r.id !== id) : undefined,
                );
            },
        );

        // Voice Channel States
        awc.addAccordEventListener<VoiceChannelState>(
            AccordOperation.VOICE_CHANNEL_STATE_CREATE,
            (voiceChannelState) => {
                voiceStateStore.create(voiceChannelState);
            },
        );

        awc.addAccordEventListener<
            Pick<VoiceChannelState, 'channelId' | 'guildId'> & { userId: string }
        >(AccordOperation.VOICE_CHANNEL_STATE_DELETE, ({ channelId, userId }) => {
            voiceStateStore.delete(channelId, userId);
        });

        awc.addAccordEventListener<
            Pick<VoiceChannelState, 'channelId' | 'guildId' | 'mute' | 'selfMute' | 'selfDeaf'> & {
                userId: string;
            }
        >(AccordOperation.VOICE_CHANNEL_STATE_UPDATE, (voiceChannelState) => {
            voiceStateStore.update(voiceChannelState);
        });

        return () => awc.close();
    }, []);

    return ready ? <>{children}</> : <FullScreenLoadingSpinner />;
};
