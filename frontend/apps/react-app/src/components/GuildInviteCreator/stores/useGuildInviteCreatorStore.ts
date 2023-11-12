import { create } from 'zustand';
import { combine } from 'zustand/middleware';

export const useGuildInviteCreatorStore = create(
  combine({ isOpen: false, inviteId: null as string | null }, (set) => ({
    open: (inviteId: string) => {
      console.log({ inviteId });
      return set({ isOpen: true, inviteId });
    },
    close: () => set({ isOpen: false, inviteId: null }),
  })),
);

export const guildInviteCreatorStore = useGuildInviteCreatorStore.getState();
