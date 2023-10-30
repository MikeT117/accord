import { create } from 'zustand';
import { combine } from 'zustand/middleware';

export const USER_OVERVIEW = 'USER_OVERVIEW';
export const USER_GUILDS = 'USER_GUILDS';
export const USER_GUILD_PROFILES = 'USER_GUILD_PROFILES';
export const USER_SESSIONS = 'USER_SESSIONS';

type Section =
  | typeof USER_OVERVIEW
  | typeof USER_GUILDS
  | typeof USER_GUILD_PROFILES
  | typeof USER_SESSIONS;

export const useCurrentUserSettingsStore = create(
  combine(
    {
      isOpen: false,
      section: USER_OVERVIEW as Section,
    },
    (set) => ({
      toggleOpen: () =>
        set((s) => {
          if (s.isOpen) {
            return { isOpen: false };
          }
          return { isOpen: true };
        }),
      setSection: (section: Section) => set({ section }),
    }),
  ),
);

export const currentUserSettingsStore = useCurrentUserSettingsStore.getState();
