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

export const ConfirmationActionType = {
  DELETE: 'delete',
  LEAVE: 'leave',
} as const;

const ConfirmationActionSubject = {
  SERVER: 'server',
  ROLE: 'role',
  CHANNEL: 'channel',
  MESSAGE: 'message',
  ACCOUNT: 'account',
  RELATIONSHIP: 'relationship',
} as const;

export type ConfirmationActionTypes = ObjectValues<typeof ConfirmationActionType>;
export type ConfirmationActionSubjects = ObjectValues<typeof ConfirmationActionSubject>;

export const useActionConfirmationStore = create(
  combine(
    {
      isOpen: false as boolean,
      actionType: null as ConfirmationActionTypes | null,
      actionSubject: null as ConfirmationActionSubjects | null,
      user: null as Pick<UserLimited, 'id' | 'displayName'> | null,
      guild: null as Pick<Guild, 'id' | 'name'> | null,
      guildRole: null as Pick<GuildRole, 'id' | 'guildId' | 'name'> | null,
      channel: null as Pick<Channel, 'id' | 'channelType' | 'name'> | null,
      channelMessage: null as ChannelMessage | null,
      relationship: null as UserRelationship | null,
      confirmation: '',
      action: null as (() => void) | null,
    },
    (set) => ({
      toggleOpen: () =>
        set((s) => {
          if (s.isOpen) {
            return {
              isOpen: false,
              guild: null,
              channel: null,
              channelMessage: null,
              guildRole: null,
              warning: '',
              confirmation: '',
              action: null,
            };
          }
          return { isOpen: true };
        }),
      setRelationship: (relationship: UserRelationship, action: () => void) =>
        set({
          isOpen: true,
          relationship,
          actionSubject: ConfirmationActionSubject.RELATIONSHIP,
          actionType: ConfirmationActionType.DELETE,
          action,
        }),
      setAccount: (user: Pick<UserLimited, 'id' | 'displayName'>, action: () => void) =>
        set({
          user,
          isOpen: true,
          actionSubject: ConfirmationActionSubject.ACCOUNT,
          actionType: ConfirmationActionType.DELETE,
          action,
        }),
      setGuild: (
        guild: Pick<Guild, 'id' | 'name'>,
        actionType: ConfirmationActionTypes,
        action: () => void,
      ) =>
        set({
          guild,
          isOpen: true,
          actionSubject: ConfirmationActionSubject.SERVER,
          actionType,
          action,
        }),
      setChannel: (channel: Pick<Channel, 'id' | 'channelType' | 'name'>, action: () => void) =>
        set({
          channel,
          isOpen: true,
          actionSubject: ConfirmationActionSubject.SERVER,
          actionType: ConfirmationActionType.DELETE,
          action,
        }),
      setChannelMessage: (channelMessage: ChannelMessage, action: () => void) =>
        set({
          channelMessage,
          isOpen: true,
          actionSubject: ConfirmationActionSubject.MESSAGE,
          actionType: ConfirmationActionType.DELETE,
          action,
        }),
      setGuildRole: (guildRole: Pick<GuildRole, 'id' | 'guildId' | 'name'>, action: () => void) =>
        set({
          guildRole,
          isOpen: true,
          actionSubject: ConfirmationActionSubject.ROLE,
          actionType: ConfirmationActionType.DELETE,
          action,
        }),
      setConfirmation: (confirmation: string) => set({ confirmation }),
    }),
  ),
);

export const actionConfirmationStore = useActionConfirmationStore.getState();
