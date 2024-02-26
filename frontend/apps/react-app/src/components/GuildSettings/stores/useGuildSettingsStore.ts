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

const defaultState = {
    isOpen: false,
    isRoleMemberAssignmentOpen: false,
    section: GUILD_OVERVIEW as GuildSettingsSection,
    roleId: null as string | null,
};

export const useGuildSettingsStore = create(
    combine({ ...defaultState }, (set) => ({
        open: () => set({ ...defaultState, isOpen: true }),
        close: () => set({ ...defaultState, isOpen: false }),
        openRoleMemberAssignment: () => set({ isRoleMemberAssignmentOpen: true }),
        closeRoleMemberAssignment: () => set({ isRoleMemberAssignmentOpen: false }),
        setRole: (roleId: string) => set({ roleId, section: GUILD_ROLE_EDITOR }),
        setSection: (section: GuildSettingsSection) => set({ section }),
    })),
);

export const guildSettingsStore = useGuildSettingsStore.getState();
