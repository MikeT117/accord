import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import { User } from '../types';

export const useCurrentUserStore = create(
    combine({ user: null as User | null }, (set) => ({
        initialise: (user: User) => set({ user }),
        update: (user: Partial<User>) =>
            set((s) => ({ user: s.user != null ? { ...s.user, ...user } : s.user })),
    })),
);

export const currentUserStore = useCurrentUserStore.getState();

export const useCurrentUserId = () => {
    // This should never be empty.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return useCurrentUserStore((s) => s.user!.id);
};
