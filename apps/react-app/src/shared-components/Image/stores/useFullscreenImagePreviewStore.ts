import create from 'zustand';
import { combine } from 'zustand/middleware';

export const useFullscreenImagePreviewStore = create(
  combine(
    {
      src: null as string | null,
      isOpen: false as boolean,
    },
    (set) => ({
      actions: {
        setSrc: (src: string) => set({ src, isOpen: true }),
        toggleOpen: () =>
          set((s) => {
            if (s.isOpen) {
              return { isOpen: false, src: null };
            } else {
              if (s.src) {
                return { isOpen: true };
              }
            }
            return s;
          }),
      },
    }),
  ),
);

export const fullscreenImagePreviewActions = useFullscreenImagePreviewStore.getState().actions;
