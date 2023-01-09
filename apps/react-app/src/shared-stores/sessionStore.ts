import create from 'zustand';
import { combine, persist } from 'zustand/middleware';

export const useSessionStore = create(
  persist(
    combine({ accesstoken: '', refreshtoken: '' }, (set) => ({
      actions: {
        setSession: (session: { accesstoken: string; refreshtoken: string }) => set({ ...session }),
        setAccesstoken: (accesstoken: string) => set({ accesstoken }),
        setRefreshtoken: (refreshtoken: string) => set({ refreshtoken }),
        clearSession: () => set({ accesstoken: '', refreshtoken: '' }),
      },
    })),
    { name: 'sessionStore' },
  ),
);

export const sessionStoreActions = useSessionStore.getState().actions;
