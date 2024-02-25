import { create } from 'zustand';
import { combine } from 'zustand/middleware';

const defaultState = {
    isOpen: false,
};

export const useGuildCreatorStore = create(
    combine({ ...defaultState }, (set) => ({
        open: () => set({ isOpen: true }),
        close: () => set({ ...defaultState }),
    })),
);

export const guildCreatorStore = useGuildCreatorStore.getState();
