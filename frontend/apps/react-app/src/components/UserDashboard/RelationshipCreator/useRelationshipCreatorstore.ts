import { create } from 'zustand';
import { combine } from 'zustand/middleware';

export const useRelationshipCreatorStore = create(
  combine(
    {
      isOpen: false,
      displayName: '',
    },
    (set, get) => ({
      toggleOpen: () =>
        set((s) => {
          if (s.isOpen) {
            return { isOpen: false, displayName: '' };
          }
          return { isOpen: true };
        }),
      setDisplayName: (displayName: string) => set({ displayName }),
      isDisplayNameValid: () => get().displayName.replace(' ', '').length !== 0,
    }),
  ),
);
