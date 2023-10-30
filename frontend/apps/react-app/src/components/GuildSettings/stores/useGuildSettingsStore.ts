import { create } from 'zustand';
import { combine } from 'zustand/middleware';

export const GUILD_OVERVIEW = 'GUILD_OVERVIEW';
export const GUILD_ROLES = 'GUILD_ROLES';
export const GUILD_ROLE_EDITOR = 'GUILD_ROLE_EDITOR';
export const GUILD_INVITES = 'GUILD_INVITES';
export const GUILD_BANS = 'GUILD_BANS';
export const GUILD_MEMBERS = 'GUILD_MEMBERS';
export const GUILD_COMMUNITY = 'GUILD_COMMUNITY';

export type GuildSettingsSection =
  | typeof GUILD_OVERVIEW
  | typeof GUILD_INVITES
  | typeof GUILD_BANS
  | typeof GUILD_MEMBERS
  | typeof GUILD_ROLES
  | typeof GUILD_ROLE_EDITOR;

export const useGuildSettingsStore = create(
  combine(
    {
      isOpen: false,
      isAssignRoleMembersOpen: false,
      section: GUILD_OVERVIEW as GuildSettingsSection,
      guildRoleId: null as string | null,
    },
    (set) => ({
      toggleOpen: () =>
        set((s) => {
          if (s.isOpen) {
            return {
              isOpen: false,
              isAssignRoleMembersOpen: false,
              section: GUILD_OVERVIEW,
              guildRole: null,
            };
          }
          return { isOpen: true };
        }),
      toggleAssignRoleMembersOpen: () =>
        set((s) => ({ isAssignRoleMembersOpen: !s.isAssignRoleMembersOpen })),
      setRole: (guildRoleId: string) => set({ guildRoleId, section: GUILD_ROLE_EDITOR }),
      setSection: (section: GuildSettingsSection) => set({ section }),
    }),
  ),
);

export const guildSettingsStore = useGuildSettingsStore.getState();
