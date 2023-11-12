import { create } from 'zustand';
import { combine } from 'zustand/middleware';

export const useRelationshipCreatorStore = create(
  combine(
    {
      isOpen: false,
      username: '',
    },
    (set, get) => ({
      toggleOpen: () =>
        set((s) => {
          if (s.isOpen) {
            return { isOpen: false, username: '' };
          }
          return { isOpen: true };
        }),
      setDisplayName: (username: string) => set({ username }),
      isDisplayNameValid: () => get().username.replace(' ', '').length !== 0,
    }),
  ),
);
