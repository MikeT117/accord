import type { GuildChannel } from '@accord/common';
import create from 'zustand';
import { combine } from 'zustand/middleware';

type Dictionary<T> = {
  [key: string]: T | undefined;
};

export const useGuildChannelStore = create(
  combine(
    {
      ids: [] as string[],
      channels: {} as Dictionary<GuildChannel>,
    },
    (set) => ({
      initialise: (channels: GuildChannel[]) =>
        set(() => {
          const _ids: string[] = [];
          const _channels: Dictionary<GuildChannel> = {};
          for (const channel of channels) {
            _ids.push(channel.id);
            _channels[channel.id] = channel;
          }
          return { ids: _ids, channels: _channels };
        }),
      addChannel: (channel: GuildChannel) => {
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
      addManyChannels: (channels: GuildChannel[]) => {
        return set((s) => {
          const _ids: string[] = [];
          const _channels: Dictionary<GuildChannel> = {};
          for (const channel of channels) {
            if (!s.channels[channel.id]) {
              _ids.push(channel.id);
              _channels[channel.id] = channel;
            }
          }
          return { channels: { ...s.channels, ..._channels }, ids: [...s.ids, ..._ids] };
        });
      },
      updateChannel: (channel: Pick<GuildChannel, 'id'> & Partial<Omit<GuildChannel, 'id'>>) => {
        return set((s) => {
          const prev = s.channels[channel.id];
          if (prev) {
            return {
              channels: { ...s.channels, [prev.id]: { ...prev, ...channel } },
            };
          }
          return s;
        });
      },
      deleteChannel: (id: string) => {
        return set((s) => {
          const channels = s.channels;
          if (id in channels) {
            delete channels[id];
            return { channels, ids: s.ids.filter((i) => i !== id) };
          }
          return s;
        });
      },
      deleteChannelByGuildId: (id: string) => {
        return set((s) => {
          const _ids: string[] = [];
          const _channels: Dictionary<GuildChannel> = {};
          for (const channel of Object.values(s.channels)) {
            if (channel && channel.guildId !== id) {
              _ids.push(channel.id);
              _channels[channel.id] = channel;
            }
          }
          return { channels: _channels, ids: _ids };
        });
      },
    }),
  ),
);

export const guildChannelStore = useGuildChannelStore.getState();
