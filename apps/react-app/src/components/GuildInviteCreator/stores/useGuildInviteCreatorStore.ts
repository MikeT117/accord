import create from 'zustand';
import { combine } from 'zustand/middleware';

export const useGuildInviteCreatorStore = create(
  combine({ isOpen: false }, (set) => ({
    toggleOpen: () => set((s) => ({ isOpen: !s.isOpen })),
  })),
);

export const guildInviteCreatorStore = useGuildInviteCreatorStore.getState();
