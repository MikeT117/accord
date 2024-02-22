import { create } from 'zustand';
import { combine } from 'zustand/middleware';

export const useImageStore = create(
    combine(
        {
            src: null as string | null,
            isOpen: false as boolean,
        },
        (set) => ({
            open: (src: string) => set({ src, isOpen: true }),
            close: () => set({ src: null, isOpen: false }),
        }),
    ),
);

export const imageStore = useImageStore.getState();
