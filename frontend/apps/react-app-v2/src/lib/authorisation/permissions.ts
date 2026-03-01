import { guildStore } from "../valtio/stores/guild-store";
import { userRoleStore } from "../valtio/stores/user-roles-store";
import { GUILD_PERMISSION, USER_FLAG } from "../constants";
import type { OptionalReadonly, Dictionary, GuildRoleType, ValueOf } from "../types/types";
import { useGuild } from "../valtio/queries/guild-store-queries";
import { ErrChannelNotFound } from "../error";
import { useUserRoles } from "../valtio/queries/user-role-store-queries";

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

export function generatePublicFlagsNumber(publicFlagsObj: ReturnType<typeof generatePublicFlagsObj>) {
    let publicFlags = 0;
    if (publicFlagsObj.allowFriendRequests) {
        publicFlags = publicFlags | (1 << USER_FLAG.ALLOW_FRIEND_REQUESTS);
    }

    if (publicFlagsObj.allowGuildMemberDMs) {
        publicFlags = publicFlags | (1 << USER_FLAG.ALLOW_GUILD_MEMBER_DMS);
    }

    return publicFlags;
}

export function generateRolePermissionsObj(permission: number) {
    return {
        ViewGuildChannel: hasRolePermission(permission, GUILD_PERMISSION.VIEW_GUILD_CHANNEL),
        ManageGuildChannel: hasRolePermission(permission, GUILD_PERMISSION.MANAGE_GUILD_CHANNELS),
        CreateChannelMessage: hasRolePermission(permission, GUILD_PERMISSION.CREATE_CHANNEL_MESSAGE),
        ManageChannelMessage: hasRolePermission(permission, GUILD_PERMISSION.MANAGE_CHANNEL_MESSAGES),
        ManageGuild: hasRolePermission(permission, GUILD_PERMISSION.MANAGE_GUILD),
        GuildAdmin: hasRolePermission(permission, GUILD_PERMISSION.GUILD_ADMIN),
        GuildSuperAdmin: hasRolePermission(permission, GUILD_PERMISSION.GUILD_SUPER_ADMIN),
        GuildOwner: hasRolePermission(permission, GUILD_PERMISSION.GUILD_OWNER),
        ViewGuildMember: hasRolePermission(permission, GUILD_PERMISSION.VIEW_GUILD_MEMBERS),
        CreateChannelPin: hasRolePermission(permission, GUILD_PERMISSION.CREATE_CHANNEL_PIN),
    };
}

export function generateRolePermissionsNumber(permissionsObj: ReturnType<typeof generateRolePermissionsObj>) {
    let permissions = 0;
    if (permissionsObj.CreateChannelMessage) {
        permissions = permissions | (1 << GUILD_PERMISSION.CREATE_CHANNEL_MESSAGE);
    }

    if (permissionsObj.CreateChannelPin) {
        permissions = permissions | (1 << GUILD_PERMISSION.CREATE_CHANNEL_PIN);
    }

    if (permissionsObj.GuildAdmin) {
        permissions = permissions | (1 << GUILD_PERMISSION.GUILD_ADMIN);
    }

    if (permissionsObj.GuildOwner) {
        permissions = permissions | (1 << GUILD_PERMISSION.GUILD_OWNER);
    }

    if (permissionsObj.GuildSuperAdmin) {
        permissions = permissions | (1 << GUILD_PERMISSION.GUILD_SUPER_ADMIN);
    }

    if (permissionsObj.ManageChannelMessage) {
        permissions = permissions | (1 << GUILD_PERMISSION.MANAGE_CHANNEL_MESSAGES);
    }

    if (permissionsObj.ManageGuild) {
        permissions = permissions | (1 << GUILD_PERMISSION.MANAGE_GUILD);
    }

    if (permissionsObj.ManageGuildChannel) {
        permissions = permissions | (1 << GUILD_PERMISSION.MANAGE_GUILD_CHANNELS);
    }

    if (permissionsObj.ViewGuildChannel) {
        permissions = permissions | (1 << GUILD_PERMISSION.VIEW_GUILD_CHANNEL);
    }

    if (permissionsObj.ViewGuildMember) {
        permissions = permissions | (1 << GUILD_PERMISSION.VIEW_GUILD_MEMBERS);
    }

    return permissions;
}

export const useUserGuildChannelPermissions = (guildId: string, channelId: string) => {
    const guild = useGuild(guildId);
    const userRoles = useUserRoles();
    const channel = guild.channels.values[channelId];

    if (!channel) {
        throw new ErrChannelNotFound();
    }

    let permission = 0;
    channel.roleIds.keys.forEach((cr) => {
        if (guild.roles.values[cr] && userRoles.values[cr]) {
            permission = permission | guild.roles.values[cr].permissions;
        }
    });

    return generateRolePermissionsObj(permission);
};

export const useUserGuildPermissions = (guildId: string) => {
    const guild = useGuild(guildId);
    const userRoles = useUserRoles();

    let permission = 0;
    userRoles.keys.forEach((ur) => {
        if (guild.roles.values[ur]) {
            permission = permission | guild.roles.values[ur].permissions;
        }
    });

    return generateRolePermissionsObj(permission);
};

export function isChannelViewable(
    channelRoleIds: OptionalReadonly<string[]>,
    userRoleIds: OptionalReadonly<Dictionary<boolean>>,
    guildRoles: OptionalReadonly<Dictionary<GuildRoleType>>,
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
