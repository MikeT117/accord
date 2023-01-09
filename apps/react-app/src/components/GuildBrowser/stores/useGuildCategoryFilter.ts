import create from 'zustand';
import { combine } from 'zustand/middleware';

export const useGuildCategoryFilter = create(
  combine(
    {
      guildCategoryId: undefined as string | undefined,
    },
    (set) => ({
      actions: {
        setGuildCategoryId: (guildCategoryId: string | undefined) => set({ guildCategoryId }),
      },
    }),
  ),
);

export const guildCategoryFilterActions = useGuildCategoryFilter.getState().actions;
