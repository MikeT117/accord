import type { PrivateChannel } from '@accord/common';
import { create } from 'zustand';
import { combine, devtools } from 'zustand/middleware';

type Dictionary<T> = {
  [key: string]: T | undefined;
};

export const usePrivateChannelStore = create(
  devtools(
    combine(
      {
        ids: [] as string[],
        channels: {} as Dictionary<PrivateChannel>,
      },
      (set, get) => ({
        initialise: (channels: PrivateChannel[]) =>
          set(() => {
            const _ids: string[] = [];
            const _channels: Dictionary<PrivateChannel> = {};
            for (const channel of channels) {
              _ids.push(channel.id);
              _channels[channel.id] = channel;
            }
            return { ids: _ids, channels: _channels };
          }),
        addChannel: (channel: PrivateChannel) => {
          return set((s) => {
            if (!(channel.id in s.channels)) {
              return {
                channels: { ...s.channels, [channel.id]: channel },
                ids: [...s.ids, channel.id],
              };
            }
            return s;
          });
        },
        updateChannel: (
          channel: Pick<PrivateChannel, 'id'> & Partial<Omit<PrivateChannel, 'id'>>,
        ) => {
          set((s) => {
            const prev = s.channels[channel.id];
            if (prev) {
              return {
                channels: { ...s.channels, [prev.id]: { ...prev, ...channel } },
              };
            }
            return s;
          });
        },
        deleteChannel: (channel: Pick<PrivateChannel, 'id'>) => {
          const channels = get().channels;
          const ids = get().ids;
          if (channel.id in channels) {
            delete channels[channel.id];
            set({ channels, ids: ids.filter((i) => i !== channel.id) });
          }
        },
        getPrivateChannelByMembers: (recipientUserId: string) => {
          const ids = get().ids;
          const channels = get().channels;
          return ids
            .map((id) => channels[id])
            .find(
              (c) => c && c.members.length <= 2 && c?.members.some((m) => m.id === recipientUserId),
            );
        },
      }),
    ),
    { name: 'privateChannelStore' },
  ),
);

export const privateChannelStore = usePrivateChannelStore.getState();
