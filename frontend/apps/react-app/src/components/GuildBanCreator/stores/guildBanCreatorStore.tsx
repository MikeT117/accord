import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import { User } from '../../../types';

export const useGuildBanCreatorStore = create(
    combine(
        {
            isOpen: false,
            guildId: null as string | null,
            user: null as null | Pick<User, 'id' | 'avatar' | 'displayName'>,
        },
        (set) => ({
            open: (guildId: string, user: Pick<User, 'id' | 'avatar' | 'displayName'>) =>
                set({ isOpen: true, guildId, user }),
            close: () => set({ isOpen: false, guildId: null, user: null }),
        }),
    ),
);

export const guildBanCreatorStore = useGuildBanCreatorStore.getState();
