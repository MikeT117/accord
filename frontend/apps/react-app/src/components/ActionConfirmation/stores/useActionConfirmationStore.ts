import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import {
    ChannelMessage,
    Guild,
    UserLimited,
    GuildRole,
    ObjectValues,
    UserRelationship,
    Channel,
} from '../../../types';

const ActionType = {
    DELETE: 'delete',
    LEAVE: 'leave',
    BAN: 'ban',
} as const;

const ActionSubject = {
    SERVER: 'server',
    ROLE: 'role',
    CHANNEL: 'channel',
    MESSAGE: 'message',
    ACCOUNT: 'account',
    RELATIONSHIP: 'relationship',
    USER: 'user',
} as const;

export type ActionTypes = ObjectValues<typeof ActionType>;
export type ActionSubjects = ObjectValues<typeof ActionSubject>;

const defaultState = {
    isOpen: false as boolean,
    actionType: null as ActionTypes | null,
    actionSubject: null as ActionSubjects | null,
    user: null as Pick<UserLimited, 'displayName'> | null,
    guild: null as Pick<Guild, 'id' | 'name'> | null,
    guildRole: null as Pick<GuildRole, 'id' | 'guildId' | 'name'> | null,
    channel: null as Pick<Channel, 'id' | 'channelType' | 'name'> | null,
    message: null as ChannelMessage | null,
    relationship: null as UserRelationship | null,
    confirmation: '',
    action: null as (() => void) | null,
};

export const useActionConfirmationStore = create(
    combine({ ...defaultState }, (set) => ({
        open: () => set({ isOpen: true }),
        close: () => set({ ...defaultState }),
        deleteRelationship: (relationship: UserRelationship, action: () => void) =>
            set({
                isOpen: true,
                relationship,
                actionSubject: 'relationship',
                actionType: 'delete',
                action,
            }),
        deleteUser: (displayName: string, action: () => void) =>
            set({
                user: { displayName },
                isOpen: true,
                actionSubject: 'account',
                actionType: 'delete',
                action,
            }),
        deleteGuild: (guild: Pick<Guild, 'id' | 'name'>, action: () => void) =>
            set({
                guild,
                isOpen: true,
                actionSubject: 'server',
                actionType: 'delete',
                action,
            }),
        leaveGuild: (guild: Pick<Guild, 'id' | 'name'>, action: () => void) =>
            set({
                guild,
                isOpen: true,
                actionSubject: 'server',
                actionType: 'leave',
                action,
            }),
        deleteChannel: (
            channel: Pick<Channel, 'id' | 'channelType' | 'name'>,
            action: () => void,
        ) =>
            set({
                channel,
                isOpen: true,
                actionSubject: 'server',
                actionType: 'delete',
                action,
            }),
        deleteMessage: (message: ChannelMessage, action: () => void) =>
            set({
                message,
                isOpen: true,
                actionSubject: 'message',
                actionType: 'delete',
                action,
            }),
        deleteGuildRole: (
            guildRole: Pick<GuildRole, 'id' | 'guildId' | 'name'>,
            action: () => void,
        ) =>
            set({
                guildRole,
                isOpen: true,
                actionSubject: 'role',
                actionType: 'delete',
                action,
            }),
        setConfirmation: (confirmation: string) => set({ confirmation }),
    })),
);

export const actionConfirmationStore = useActionConfirmationStore.getState();
