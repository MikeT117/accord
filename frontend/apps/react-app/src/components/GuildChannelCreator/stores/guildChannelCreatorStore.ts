import { create } from 'zustand';
import { combine } from 'zustand/middleware';

export const useGuildChannelCreatorStore = create(
    combine({ isOpen: false, isCategory: false }, (set) => ({
        open: (isCategory?: boolean) =>
            set({
                isOpen: true,
                isCategory,
            }),
        close: () =>
            set({
                isOpen: false,
                isCategory: false,
            }),
    })),
);

export const guildChannelCreatorStore = useGuildChannelCreatorStore.getState();
