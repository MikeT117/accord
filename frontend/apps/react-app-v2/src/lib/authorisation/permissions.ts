import { guildStore } from "../valtio/stores/guild-store";
import { userRoleStore } from "../valtio/stores/user-roles-store";
import { GUILD_PERMISSION, USER_FLAG } from "../constants";
import type { OptionalReadonly, Dictionary, GuildRoleType, ValueOf } from "../types/types";
import { useGuild } from "../valtio/queries/guild-store-queries";
import { ErrChannelNotFound } from "../error";

function hasRolePermission(permission: number, flag: ValueOf<typeof GUILD_PERMISSION>) {
    return (permission & (1 << flag)) !== 0;
}

function hasUserFlag(permission: number, flag: ValueOf<typeof USER_FLAG>) {
    return (permission & (1 << flag)) !== 0;
}

export function generatePublicFlagsObj(flag: number) {
    return {
        allowFriendRequests: hasUserFlag(flag, USER_FLAG.ALLOW_FRIEND_REQUESTS),
        allowGuildMemberDMs: hasUserFlag(flag, USER_FLAG.ALLOW_GUILD_MEMBER_DMS),
    };
}

export function generatePublicFlagsNumber(permissionsObj: ReturnType<typeof generatePublicFlagsObj>) {
    let publicFlags = 0;
    if (permissionsObj.allowFriendRequests) {
        publicFlags = publicFlags | (1 << USER_FLAG.ALLOW_FRIEND_REQUESTS);
    }

    if (permissionsObj.allowGuildMemberDMs) {
        publicFlags = publicFlags | (1 << USER_FLAG.ALLOW_GUILD_MEMBER_DMS);
    }

    return publicFlags;
}

export function generatePermissionsObj(permission: number) {
    return {
        hasViewGuildChannel: hasRolePermission(permission, GUILD_PERMISSION.VIEW_GUILD_CHANNEL),
        hasManageGuildChannel: hasRolePermission(permission, GUILD_PERMISSION.MANAGE_GUILD_CHANNELS),
        hasCreateChannelMessage: hasRolePermission(permission, GUILD_PERMISSION.CREATE_CHANNEL_MESSAGE),
        hasManageChannelMessage: hasRolePermission(permission, GUILD_PERMISSION.MANAGE_CHANNEL_MESSAGES),
        hasManageGuild: hasRolePermission(permission, GUILD_PERMISSION.MANAGE_GUILD),
        hasGuildAdmin: hasRolePermission(permission, GUILD_PERMISSION.GUILD_ADMIN),
        hasGuildSuperAdmin: hasRolePermission(permission, GUILD_PERMISSION.GUILD_SUPER_ADMIN),
        hasGuildOwner: hasRolePermission(permission, GUILD_PERMISSION.GUILD_OWNER),
        hasViewGuildMember: hasRolePermission(permission, GUILD_PERMISSION.VIEW_GUILD_MEMBERS),
        hasCreateChannelPin: hasRolePermission(permission, GUILD_PERMISSION.CREATE_CHANNEL_PIN),
    };
}

export const useUserGuildChannelPermissions = (guildId: string, channelId: string) => {
    const guild = useGuild(guildId);
    const channel = guild.channels.values[channelId];
    if (!channel) throw new ErrChannelNotFound();

    let permission = 0;
    channel.roleIds.keys.forEach((cr) => {
        if (guild.roles.values[cr] && userRoleStore.values[cr]) {
            permission = permission | guild.roles.values[cr].permissions;
        }
    });

    return generatePermissionsObj(permission);
};

export const useUserGuildPermissions = (guildId: string) => {
    const guild = useGuild(guildId);

    let permission = 0;
    userRoleStore.keys.forEach((ur) => {
        if (guild.roles.values[ur]) {
            permission = permission | guild.roles.values[ur].permissions;
        }
    });

    return generatePermissionsObj(permission);
};

export function isChannelViewable(
    channelRoleIds: OptionalReadonly<string[]>,
    userRoleIds: OptionalReadonly<Dictionary<boolean>>,
    guildRoles: OptionalReadonly<Dictionary<GuildRoleType>>
) {
    for (const channelRoleId of channelRoleIds) {
        if (!userRoleIds[channelRoleId] || !guildRoles[channelRoleId]) {
            continue;
        }

        if (hasRolePermission(guildRoles[channelRoleId].permissions, GUILD_PERMISSION.VIEW_GUILD_CHANNEL)) {
            return true;
        }
    }

    return false;
}

export function isGuildChannelAccessible(guildId: string, channelId: string) {
    const guild = guildStore.values[guildId];
    if (!guild) return false;

    const channel = guild.channels.values[channelId];
    if (!channel) return false;

    return isChannelViewable(channel.roleIds.keys, userRoleStore.values, guild.roles.values);
}
