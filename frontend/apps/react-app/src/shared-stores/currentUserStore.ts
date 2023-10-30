import type { UserAccount } from '@accord/common';
import { useCallback } from 'react';
import { create } from 'zustand';
import { combine, devtools } from 'zustand/middleware';

export const useCurrentUserStore = create(
  devtools(
    combine({ user: null as UserAccount | null }, (set) => ({
      initialise: (user: UserAccount) => set({ user }),
      updateUser: (user: Partial<UserAccount>) =>
        set((s) => ({ user: s.user != null ? { ...s.user, ...user } : s.user })),
    })),
    { name: 'CurrentUserStore' },
  ),
);

export const currentUserStore = useCurrentUserStore.getState();

export const useCurrentUserId = () => {
  // This should never be empty.
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return useCurrentUserStore(useCallback((s) => s.user!.id, []));
};

export const useCurrentUser = () => {
  return useCurrentUserStore(useCallback((s) => s.user, []));
};
