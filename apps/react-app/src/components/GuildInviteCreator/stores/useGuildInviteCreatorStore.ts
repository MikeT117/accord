import create from 'zustand';
import { combine } from 'zustand/middleware';

export const useGuildInviteCreatorStore = create(
  combine({ isOpen: false }, (set) => ({
    actions: {
      toggleOpen: () => set((s) => ({ isOpen: !s.isOpen })),
    },
  })),
);

export const guildInviteCreatorActions = useGuildInviteCreatorStore.getState().actions;
