import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import { Dictionary, PrivateChannel } from '../types';

export const usePrivateChannelStore = create(
    combine(
        {
            ids: [] as string[],
            channels: {} as Dictionary<PrivateChannel>,
        },
        (set, get) => ({
            initialise: (channels: PrivateChannel[]) => {
                const _ids: string[] = [];
                const _channels: Dictionary<PrivateChannel> = {};
                for (const channel of channels) {
                    _ids.push(channel.id);
                    _channels[channel.id] = channel;
                }

                set({ ids: _ids, channels: _channels });
            },
            create: (channel: PrivateChannel) => {
                set((s) => {
                    const channels = s.channels;

                    if (channel.id in channels) {
                        return s;
                    }

                    return {
                        channels: { ...channels, [channel.id]: channel },
                        ids: [...s.ids, channel.id],
                    };
                });
            },
            update: (channel: Pick<PrivateChannel, 'id'> & Partial<Omit<PrivateChannel, 'id'>>) => {
                set((s) => {
                    const prev = s.channels[channel.id];

                    if (!prev) {
                        return s;
                    }

                    return {
                        channels: { ...s.channels, [prev.id]: { ...prev, ...channel } },
                    };
                });
            },
            delete: (channel: Pick<PrivateChannel, 'id'>) => {
                set((s) => {
                    if (!(channel.id in s.channels)) {
                        return s;
                    }

                    const channels = s.channels;
                    const ids = s.ids;

                    delete channels[channel.id];

                    return { channels, ids: ids.filter((i) => i !== channel.id) };
                });
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
);

export const privateChannelStore = usePrivateChannelStore.getState();
