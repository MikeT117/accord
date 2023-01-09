import type { UserAccount } from '@accord/common';
import { useCallback } from 'react';
import create from 'zustand';
import { combine } from 'zustand/middleware';

export const useLoggedInUserStore = create(
  combine({ user: null as UserAccount | null }, (set) => ({
    actions: {
      initialise: (user: UserAccount) => set({ user }),
      updateUser: (user: Partial<UserAccount>) =>
        set((s) => ({ user: s.user != null ? { ...s.user, ...user } : s.user })),
    },
  })),
);

export const loggedInUserActions = useLoggedInUserStore.getState().actions;

export const useLoggedInUserId = () => {
  // This should never be empty.
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return useLoggedInUserStore(useCallback((s) => s.user!.id, []));
};
