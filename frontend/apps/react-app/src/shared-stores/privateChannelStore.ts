import { create } from 'zustand';
import { combine, devtools } from 'zustand/middleware';
import { PrivateChannel } from '../types';

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
        create: (channel: PrivateChannel) => {
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
        update: (channel: Pick<PrivateChannel, 'id'> & Partial<Omit<PrivateChannel, 'id'>>) => {
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
        delete: (channel: Pick<PrivateChannel, 'id'>) => {
          const channels = get().channels;
          const ids = get().ids;
          if (channel.id in channels) {
            delete channels[channel.id];
            set({ channels, ids: ids.filter((i) => i !== channel.id) });
          }
        },
        selectByMemberIds: (userId: string) => {
          const ids = get().ids;
          const channels = get().channels;
          return ids
            .map((id) => channels[id])
            .find((c) => c && c.users.length <= 2 && c?.users.some((m) => m.id === userId));
        },
      }),
    ),
    { name: 'privateChannelStore' },
  ),
);

export const privateChannelStore = usePrivateChannelStore.getState();
