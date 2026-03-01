import { isGuildCategoryChannel, isGuildTextChannel, isGuildVoiceChannel } from "@/lib/types/guards";
import type {
    GuildCategoryChannelType,
    GuildRoleType,
    GuildTextChannelType,
    GuildVoiceChannelType,
    VoiceStateType,
    Snapshot,
} from "@/lib/types/types";
import { useSnapshot } from "valtio";
import { guildStore } from "../stores/guild-store";
import { userRoleStore } from "../stores/user-roles-store";
import { isChannelViewable } from "@/lib/authorisation/permissions";
import { ErrChannelNotFound, ErrRoleNotFound, ErrGuildNotFound } from "@/lib/error";
import { userStore } from "../stores/user-store";

export function useGuild(guildId: string) {
    const guildStoreSnapshot = useSnapshot(guildStore, { sync: true });
    const guild = guildStoreSnapshot.values[guildId];
    if (!guild) {
        throw new ErrGuildNotFound();
    }

    return guild;
}

export function useGuildsArray() {
    const guildStoreSnapshot = useSnapshot(guildStore);
    return guildStoreSnapshot.keys.map((k) => guildStoreSnapshot.values[k]!);
}

export function useGuildTextOrVoiceChannel(guildId: string, channelId: string) {
    const channel = useViewableGuildChannel(guildId, channelId);
    if (isGuildTextChannel(channel)) {
        return channel as GuildTextChannelType;
    }

    if (isGuildVoiceChannel(channel)) {
        return channel as GuildVoiceChannelType;
    }

    throw new ErrChannelNotFound();
}

export function useGuildChannel(guildId: string, channelId: string) {
    return useViewableGuildChannel(guildId, channelId);
}

export function useGuildTextChannel(guildId: string, channelId: string) {
    const channel = useViewableGuildChannel(guildId, channelId);
    if (!isGuildTextChannel(channel)) {
        throw new ErrChannelNotFound();
    }

    return channel;
}

export function useGuildCategoryChannel(guildId: string, channelId: string) {
    const channel = useViewableGuildChannel(guildId, channelId);
    if (!isGuildCategoryChannel(channel)) throw new ErrChannelNotFound();
    return channel;
}

export function useGuildVoiceChannel(guildId: string, channelId: string) {
    const channel = useViewableGuildChannel(guildId, channelId);
    if (!isGuildVoiceChannel(channel)) throw new ErrChannelNotFound();
    return channel;
}

export function useVoiceStates(guildId: string, channelId: string) {
    const channel = useViewableGuildChannel(guildId, channelId);
    if (!isGuildVoiceChannel(channel)) throw new ErrChannelNotFound();
    const guildSnapshot = useGuild(guildId);

    const voiceStates: VoiceStateType[] = [];
    for (const key of guildSnapshot.voiceStates.keys) {
        if (!guildSnapshot.voiceStates.values[key]) {
            continue;
        }

        // Non-null assertion based on above check
        if (guildSnapshot.voiceStates.values[key]!.channelId !== channelId) {
            continue;
        }

        // Non-null assertion based on first check
        voiceStates.push(guildSnapshot.voiceStates.values[key]!);
    }
    return voiceStates;
}

export function useCurrentUserVoiceState() {
    const guildsSnapshot = useGuildsArray();
    const userStoreSnapshot = useSnapshot(userStore);

    if (!userStoreSnapshot.initialised) {
        return null;
    }

    for (const guild of guildsSnapshot) {
        for (const key of guild.voiceStates.keys) {
            if (guild.voiceStates.values[key]?.user.id === userStoreSnapshot.user?.id) {
                const voiceState = guild.voiceStates.values[key];
                const channel = guild.channels.values[voiceState.channelId];

                if (!channel) {
                    return null;
                }

                return { voiceState, channel, guild };
            }
        }
    }

    return null;
}

export function useGuildRolesArray(guildId: string) {
    const guildSnapshot = useGuild(guildId);
    const custom: GuildRoleType[] = [];
    let defaultRole: GuildRoleType | null = null;
    let ownerRole: GuildRoleType | null = null;

    for (const key of guildSnapshot.roles.keys) {
        const role = guildSnapshot.roles.values[key];
        if (!role) {
            throw new ErrRoleNotFound();
        }

        if (role.name === "@default") {
            defaultRole = role;
            continue;
        }

        if (role.name === "@owner") {
            ownerRole = role;
            continue;
        }

        custom.push(role);
    }

    if (!defaultRole || !ownerRole) {
        throw new ErrRoleNotFound();
    }

    return { custom, defaultRole, ownerRole };
}

export function useGuildRolesMap(guildId: string) {
    const guildSnapshot = useGuild(guildId);
    return guildSnapshot.roles.values;
}

export function useSortedGuildChannels(guildId: string) {
    const guildSnapshot = useGuild(guildId);
    const userRoleStoreSnapshot = useSnapshot(userRoleStore);

    const parents: Snapshot<GuildCategoryChannelType>[] = [];
    const children: Snapshot<GuildTextChannelType | GuildVoiceChannelType>[] = [];
    const orphans: Snapshot<GuildTextChannelType | GuildVoiceChannelType>[] = [];

    for (let i = 0; i < guildSnapshot.channels.keys.length; i++) {
        const channel = guildSnapshot.channels.values[guildSnapshot.channels.keys[i]];
        if (!channel) {
            continue;
        }

        if (!isChannelViewable(channel.roleIds.keys, userRoleStoreSnapshot.values, guildSnapshot.roles.values)) {
            continue;
        }

        if (isGuildCategoryChannel(channel)) {
            parents.push(channel);
            continue;
        }

        if (!channel.parentId || !guildSnapshot.channels.values[channel.parentId]) {
            orphans.push(channel);
            continue;
        }

        if (
            !isChannelViewable(
                guildSnapshot.channels.values[channel.parentId]?.roleIds.keys ?? [],
                userRoleStoreSnapshot.values,
                guildSnapshot.roles.values,
            )
        ) {
            orphans.push(channel);
            continue;
        }

        children.push(channel);
    }

    return { parents, children, orphans };
}

export function useGuildChannelPermissions(guildId: string, channelId: string) {
    const guild = useGuild(guildId);
    const channel = guild.channels.values[channelId];
    if (!channel) {
        throw new ErrChannelNotFound();
    }

    const isSyncedWithParent = (() => {
        if (isGuildCategoryChannel(channel) || !channel.parentId) {
            return null;
        }

        const parentChannel = guild.channels.values[channel.parentId];
        if (!parentChannel) {
            throw new ErrChannelNotFound();
        }

        if (channel.roleIds.keys.length !== parentChannel.roleIds.keys.length) {
            return false;
        }

        for (const key of parentChannel.roleIds.keys) {
            if (!channel.roleIds.values[key]) {
                return false;
            }
        }

        return true;
    })();

    const assignedRoles: GuildRoleType[] = [];
    const availableRoles: GuildRoleType[] = [];
    let defaultRoleId: string | undefined;

    for (const key of guild.roles.keys) {
        const role = guild.roles.values[key]!;
        if (!role) {
            throw new ErrRoleNotFound();
        }

        if (role.name === "@default") {
            defaultRoleId = role.id;
            continue;
        }

        if (role.name === "@owner") {
            continue;
        }

        if (channel.roleIds.values[key]) {
            assignedRoles.push(role);
        } else {
            availableRoles.push(role);
        }
    }

    if (!defaultRoleId) {
        throw new ErrRoleNotFound();
    }
    const isPrivate = !channel.roleIds.values[defaultRoleId];

    return {
        assignedRoles,
        availableRoles,
        defaultRoleId,
        isSyncedWithParent,
        isPrivate,
    };
}

function useViewableGuildChannel(guildId: string, channelId: string) {
    const guildStoreSnapshot = useGuild(guildId);
    const userRoleStoreSnapshot = useSnapshot(userRoleStore);

    const channel = guildStoreSnapshot.channels.values[channelId];
    if (!channel) {
        throw new ErrChannelNotFound();
    }

    if (!isChannelViewable(channel.roleIds.keys, userRoleStoreSnapshot.values, guildStoreSnapshot.roles.values)) {
        throw new ErrChannelNotFound();
    }

    return channel;
}

export function useIsGuildMember(guildId: string) {
    const guildStoreSnapshot = useSnapshot(guildStore);
    return !!guildStoreSnapshot.values[guildId];
}

export function doesGuildChannelExist(guildId: string, channelId: string) {
    const guild = guildStore.values[guildId];
    if (!guild) {
        return false;
    }
    return !!guild.channels.values[channelId];
}

export function doesGuildExist(guildId: string) {
    return !!guildStore.values[guildId];
}

export function getGuildRolesByIDs(guildId: string, roleIds: string[]) {
    const guild = guildStore.values[guildId];
    if (!guild) {
        return;
    }

    const roles: GuildRoleType[] = [];
    roleIds.forEach((roleId) => {
        const role = guild.roles.values[roleId];
        if (role) {
            roles.push(role);
        }
    });

    return roles;
}
