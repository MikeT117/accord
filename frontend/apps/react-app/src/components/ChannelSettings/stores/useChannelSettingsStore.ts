import { create } from 'zustand';
import { combine } from 'zustand/middleware';

export const CHANNEL_OVERVIEW = 'CHANNEL_OVERVIEW';
export const CHANNEL_ROLES = 'CHANNEL_ROLES';

export type ChannelSettingsSection = typeof CHANNEL_ROLES | typeof CHANNEL_OVERVIEW;

export const useChannelSettingsStore = create(
  combine(
    {
      isOpen: false as boolean,
      channelId: null as string | null,
      section: CHANNEL_OVERVIEW as ChannelSettingsSection,
    },
    (set) => ({
      toggleOpen: () =>
        set((s) => {
          if (s.isOpen) {
            return {
              isOpen: false,
              section: CHANNEL_OVERVIEW,
              channelId: null,
            };
          }
          return { isOpen: true };
        }),
      setChannelId: (channelId: string) => set({ channelId, isOpen: true }),
      setActiveSection: (section: ChannelSettingsSection) => set({ section }),
    }),
  ),
);

export const channelSettingsStore = useChannelSettingsStore.getState();
