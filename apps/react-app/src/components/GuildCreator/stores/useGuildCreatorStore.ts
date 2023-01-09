import create from 'zustand';
import { combine } from 'zustand/middleware';

export const useGuildCreatorStore = create(
  combine(
    {
      isOpen: false,
      name: '',
      guildCategoryId: undefined as string | undefined,
      isDiscoverable: false,
    },
    (set) => ({
      actions: {
        toggleOpen: () =>
          set((s) => {
            if (s.isOpen) {
              return {
                isOpen: false,
                name: '',
                isDiscoverable: false,
              };
            }
            return { isOpen: true };
          }),
        setName: (name: string) => set({ name }),
        setGuildCategoryId: (guildCategoryId: string) => set({ guildCategoryId }),
        toggleDiscoverable: () => set((s) => ({ isDiscoverable: !s.isDiscoverable })),
      },
    }),
  ),
);

export const guildCreatorActions = useGuildCreatorStore.getState().actions;
