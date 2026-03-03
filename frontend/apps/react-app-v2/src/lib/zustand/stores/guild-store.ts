import {
    APIChannelDeletedType,
    APIChannelRoleAssociationChangeType,
    APIChannelRoleAssociationsSetType,
    APIChannelUpdatedType,
    APIGuildChannelType,
    APIGuildDeletedType,
    APIGuildRoleDeletedType,
    APIGuildRoleType,
    APIGuildRoleUpdatedType,
    APIGuildType,
    APIGuildUpdatedType,
    APIVoiceStateDeletedType,
    APIVoiceStateType,
    APIVoiceStateUpdatedType,
    GuildRoleType,
    GuildType,
    Normalize,
    VoiceStateType,
} from "@/lib/types/types";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { apiGuildToGuild } from "../mapper/api-guild-mapper";
import { immer } from "zustand/middleware/immer";
import { apiGuildChannelToGuildChannel } from "../mapper/api-guild-channel-mapper";
import { ErrChannelNotFound, ErrGuildNotFound, ErrRoleNotFound } from "../../error";
import { generateRolePermissionsObj, hasRolePermission } from "../../authorisation/permissions";
import { useShallow } from "zustand/react/shallow";
import { useUser } from "./user-store";
import { useUserRoleStore } from "./user-role-store";
import { isGuildTextChannel, isGuildVoiceChannel } from "../../types/guards";
import { GUILD_PERMISSION } from "../../constants";

type GuildStoreType = Normalize<GuildType> & {
    initialised: boolean;
};

type GuildActions = {
    initialise: (guilds: APIGuildType[]) => void;
    createGuild: (guild: APIGuildType) => void;
    updateGuild: (updatedGuild: APIGuildUpdatedType) => void;
    deleteGuild: (deletedGuild: APIGuildDeletedType) => void;
    createChannel: (channel: APIGuildChannelType) => void;
    updateChannel: (updatedChannel: APIChannelUpdatedType) => void;
    deleteChannel: (deletedChannel: APIChannelDeletedType) => void;
    createRole: (role: APIGuildRoleType) => void;
    updateRole: (updatedRole: APIGuildRoleUpdatedType) => void;
    deleteRole: (deletedRole: APIGuildRoleDeletedType) => void;
    associateChannelRole: (associatedChannelRole: APIChannelRoleAssociationChangeType) => void;
    disassociateChannelRole: (disassociatedChannelRole: APIChannelRoleAssociationChangeType) => void;
    setChannelRoles: (channelRoles: APIChannelRoleAssociationsSetType) => void;
    createVoiceState: (voiceState: APIVoiceStateType) => void;
    updateVoiceState: (updatedVoiceState: APIVoiceStateUpdatedType) => void;
    deleteVoiceState: (deletedVoiceState: APIVoiceStateDeletedType) => void;
};

const initialState: GuildStoreType = { initialised: false, keys: [], values: {} };

type GuildStore = GuildStoreType & GuildActions;

export const useGuildStore = create<GuildStore>()(
    devtools(
        immer((set) => ({
            ...initialState,
            initialise: (guilds) => {
                return set((state) => {
                    for (const guild of guilds) {
                        state.keys.push(guild.id);
                        state.values[guild.id] = apiGuildToGuild(guild);
                    }
                    state.initialised;
                });
            },
            createGuild: (guild) => {
                return set((state) => {
                    state.keys.push(guild.id);
                    state.values[guild.id] = apiGuildToGuild(guild);
                });
            },
            updateGuild: (updatedGuild) => {
                set((state) => {
                    const guild = state.values[updatedGuild.id];
                    if (!guild) {
                        return;
                    }

                    Object.assign(guild, { ...guild, ...updatedGuild });
                });
            },
            deleteGuild: (deletedGuild) => {
                return set((state) => {
                    const index = state.keys.findIndex((c) => c === deletedGuild.id);
                    if (index !== -1) {
                        state.keys.splice(index, 1);
                    }

                    delete state.values[deletedGuild.id];
                });
            },

            createChannel: (channel) => {
                return set((state) => {
                    let guild = state.values[channel.guildId];
                    if (!guild) {
                        return;
                    }

                    guild.channels.keys.push(channel.id);
                    guild.channels.values[channel.id] = apiGuildChannelToGuildChannel(channel);
                });
            },
            updateChannel: (updatedChannel) => {
                return set((state) => {
                    let guild = state.values[updatedChannel.guildId];
                    if (!guild) {
                        return;
                    }

                    let channel = guild.channels.values[updatedChannel.id];
                    if (!channel) {
                        return;
                    }

                    Object.assign(channel, { ...channel, ...updatedChannel });
                });
            },
            deleteChannel: (deletedChannel) => {
                return set((state) => {
                    let guild = state.values[deletedChannel.guildId];
                    if (!guild) {
                        return;
                    }

                    const index = guild.channels.keys.findIndex((c) => c === deletedChannel.id);
                    if (index !== -1) {
                        guild.channels.keys.splice(index, 1);
                    }

                    delete guild.channels.values[deletedChannel.id];
                });
            },
            createRole: (role) => {
                return set((state) => {
                    let guild = state.values[role.guildId];
                    if (!guild) {
                        return;
                    }

                    guild.roles.keys.push(role.id);
                    guild.roles.values[role.id] = role;
                });
            },
            updateRole: (updatedRole) => {
                return set((state) => {
                    let guild = state.values[updatedRole.guildId];
                    if (!guild) {
                        return;
                    }

                    let role = guild.roles.values[updatedRole.id];
                    if (!role) {
                        return;
                    }

                    Object.assign(role, { ...role, ...updatedRole });
                });
            },
            deleteRole: (deletedRole) => {
                return set((state) => {
                    let guild = state.values[deletedRole.guildId];
                    if (!guild) {
                        return;
                    }

                    const index = guild.roles.keys.findIndex((c) => c === deletedRole.id);
                    if (index !== -1) {
                        guild.roles.keys.splice(index, 1);
                    }

                    delete guild.roles.values[deletedRole.id];
                });
            },
            associateChannelRole: (associatedChannelRole) => {
                return set((state) => {
                    let guild = state.values[associatedChannelRole.guildId];
                    if (!guild) {
                        return;
                    }

                    let channel = guild.channels.values[associatedChannelRole.id];
                    if (!channel) {
                        return;
                    }

                    channel.roleIds.keys.push(associatedChannelRole.roleId);
                    channel.roleIds.values[associatedChannelRole.roleId] = true;
                });
            },
            disassociateChannelRole: (disassociatedChannelRole) => {
                return set((state) => {
                    let guild = state.values[disassociatedChannelRole.guildId];
                    if (!guild) {
                        return;
                    }

                    let channel = guild.channels.values[disassociatedChannelRole.id];
                    if (!channel) {
                        return;
                    }

                    const index = channel.roleIds.keys.findIndex((c) => c === disassociatedChannelRole.roleId);
                    if (index !== -1) {
                        channel.roleIds.keys.splice(index, 1);
                    }

                    delete channel.roleIds.values[disassociatedChannelRole.roleId];
                });
            },
            setChannelRoles: (channelRoles) => {
                return set((state) => {
                    let guild = state.values[channelRoles.guildId];
                    if (!guild) {
                        return;
                    }

                    let channel = guild.channels.values[channelRoles.id];
                    if (!channel) {
                        return;
                    }

                    const roleIDs: Normalize<boolean> = {
                        keys: [],
                        values: {},
                    };

                    for (const roleId of channelRoles.roleIds) {
                        roleIDs.keys.push(roleId);
                        roleIDs.values[roleId] = true;
                    }

                    channel.roleIds = roleIDs;
                });
            },
            createVoiceState: (voiceState) => {
                return set((state) => {
                    let guild = state.values[voiceState.guildId];
                    if (!guild) {
                        return;
                    }

                    guild.voiceStates.keys.push(voiceState.id);
                    guild.voiceStates.values[voiceState.id] = voiceState;
                });
            },
            updateVoiceState: (updatedVoiceState) => {
                return set((state) => {
                    let guild = state.values[updatedVoiceState.guildId];
                    if (!guild) {
                        return;
                    }

                    let voiceState = guild.voiceStates.values[updatedVoiceState.id];
                    if (!voiceState) {
                        return;
                    }

                    Object.assign(voiceState, { ...voiceState, ...updatedVoiceState });
                });
            },
            deleteVoiceState: (deletedVoiceState) => {
                return set((state) => {
                    let guild = state.values[deletedVoiceState.guildId];
                    if (!guild) {
                        return;
                    }

                    const index = guild.voiceStates.keys.findIndex((c) => c === deletedVoiceState.id);
                    if (index !== -1) {
                        guild.voiceStates.keys.splice(index, 1);
                    }
                    delete guild.voiceStates.values[deletedVoiceState.id];
                });
            },
        })),
        { name: "guildStore", enabled: true },
    ),
);

export const useGuildWithPermissions = (guildId: string) => {
    const guild = useGuild(guildId);
    const userRoleIds = useUserRoleStore((s) => s.keys);

    if (!guild) {
        throw new ErrGuildNotFound();
    }

    let permission = 0;
    for (const roleId of userRoleIds) {
        if (!guild.roles.values[roleId]) {
            continue;
        }
        permission = permission | guild.roles.values[roleId].permissions;
    }

    return { guild, permissions: generateRolePermissionsObj(permission) };
};

export const useGuild = (guildId: string) => {
    const guild = useGuildStore((s) => s.values[guildId]);
    if (!guild) {
        throw new ErrGuildNotFound();
    }

    return guild;
};

export const useGuilds = () => {
    // Non-null assertion as the key should never exist if the value does not.
    return useGuildStore(useShallow((s) => s.keys.map((k) => s.values[k]!)));
};

export const useGuildTextChannelWithPermissions = (guildId: string, channelId: string) => {
    const guild = useGuild(guildId);
    const userRoles = useUserRoleStore((s) => s.values);

    const channel = guild.channels.values[channelId];
    if (!channel || !isGuildTextChannel(channel)) {
        throw new ErrChannelNotFound();
    }

    let permission = 0;
    for (const roleId of channel.roleIds.keys) {
        if (!guild.roles.values[roleId] || !userRoles[roleId]) {
            continue;
        }

        hasRolePermission(guild.roles.values[roleId].permissions, GUILD_PERMISSION.VIEW_GUILD_CHANNEL);
        permission = permission | guild.roles.values[roleId].permissions;
    }

    return { channel, permissions: generateRolePermissionsObj(permission) };
};

export function useCurrentUserVoiceState() {
    const guilds = useGuilds();
    const user = useUser();

    for (const guild of guilds) {
        for (const key of guild.voiceStates.keys) {
            const voiceState = guild.voiceStates.values[key];
            if (!voiceState) {
                continue;
            }

            if (voiceState.user.id !== user.id) {
                continue;
            }

            const channel = guild.channels.values[voiceState.channelId];
            if (!channel) {
                return null;
            }

            return { voiceState, channel, guild };
        }
    }

    return null;
}

export const useChannelVoiceStates = (guildId: string, channelId: string) => {
    const guild = useGuild(guildId);
    const userRoles = useUserRoleStore((s) => s.values);

    const channel = guild.channels.values[channelId];
    if (!channel || !isGuildVoiceChannel(channel)) {
        throw new ErrChannelNotFound();
    }

    let permission = 0;
    for (const roleId of channel.roleIds.keys) {
        if (!guild.roles.values[roleId] || !userRoles[roleId]) {
            continue;
        }

        hasRolePermission(guild.roles.values[roleId].permissions, GUILD_PERMISSION.VIEW_GUILD_CHANNEL);
        permission = permission | guild.roles.values[roleId].permissions;
    }

    const voiceStates: VoiceStateType[] = [];
    for (const key of guild.voiceStates.keys) {
        if (!guild.voiceStates.values[key]) {
            continue;
        }

        // Non-null assertion based on above check
        if (guild.voiceStates.values[key]!.channelId !== channelId) {
            continue;
        }

        // Non-null assertion based on first check
        voiceStates.push(guild.voiceStates.values[key]!);
    }
    return voiceStates;
};

export const useGuildChannel = (guildId: string, channelId: string) => {
    const guild = useGuild(guildId);

    const channel = guild.channels.values[channelId];
    if (!channel) {
        throw new ErrChannelNotFound();
    }

    return channel;
};

export function useIsGuildMember(guildId: string) {
    const guild = useGuildStore((s) => s.values[guildId]?.id);
    return !!guild;
}

export function useGuildRoles(guildId: string) {
    const guild = useGuild(guildId);

    const custom: GuildRoleType[] = [];
    let defaultRole: GuildRoleType | null = null;

    for (const key of guild.roles.keys) {
        const role = guild.roles.values[key];
        if (!role) {
            throw new ErrRoleNotFound();
        }

        if (role.name === "@default") {
            defaultRole = role;
            continue;
        }

        if (role.name === "@owner") {
            continue;
        }

        custom.push(role);
    }

    if (!defaultRole) {
        throw new ErrRoleNotFound();
    }

    return { custom, defaultRole };
}

export function getGuildRolesByIDs(guildId: string, roleIds: string[]) {
    const guildRoles = useGuildStore((s) => s.values[guildId]?.roles.values);
    if (!guildRoles) {
        return;
    }

    const roles: GuildRoleType[] = [];
    for (const roleId of roleIds) {
        const role = guildRoles[roleId];
        if (role) {
            roles.push(role);
        }
    }

    return roles;
}

export const guildStoreActions = {
    initialise: useGuildStore.getState().initialise,
    createGuild: useGuildStore.getState().createGuild,
    updateGuild: useGuildStore.getState().updateGuild,
    deleteGuild: useGuildStore.getState().deleteGuild,
    createChannel: useGuildStore.getState().createChannel,
    updateChannel: useGuildStore.getState().updateChannel,
    deleteChannel: useGuildStore.getState().deleteChannel,
    createRole: useGuildStore.getState().createRole,
    updateRole: useGuildStore.getState().updateRole,
    deleteRole: useGuildStore.getState().deleteRole,
    associateChannelRole: useGuildStore.getState().associateChannelRole,
    disassociateChannelRole: useGuildStore.getState().disassociateChannelRole,
    setChannelRoles: useGuildStore.getState().setChannelRoles,
    createVoiceState: useGuildStore.getState().createVoiceState,
    updateVoiceState: useGuildStore.getState().updateVoiceState,
    deleteVoiceState: useGuildStore.getState().deleteVoiceState,
};
