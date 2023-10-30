import { create } from 'zustand';
import { combine, persist } from 'zustand/middleware';

export const useHistoryStore = create(
  persist(
    combine({ guildId: null as string | null, channelId: null as string | null }, (set) => ({
      setGuildId: (guildId: string) => set({ guildId }),
      setChannelId: (channelId: string) => set({ channelId }),
      reset: () => set({ guildId: null, channelId: null }),
    })),
    { name: 'historyStore' },
  ),
);

export const historyStore = useHistoryStore.getState();
