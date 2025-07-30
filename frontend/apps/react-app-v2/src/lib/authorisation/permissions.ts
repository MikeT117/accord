import { guildStore } from "../valtio/stores/guild-store";
import { userRoleStore } from "../valtio/stores/user-roles-store";
import { GUILD_PERMISSION } from "../constants";
import type { OptionalReadonly, Dictionary, GuildRoleType } from "../types/types";
import { useGuild } from "../valtio/queries/guild-store-queries";
import { ErrChannelNotFound } from "../error";

function hasViewGuildChannel(permission: number) {
    return (permission & (1 << GUILD_PERMISSION.VIEW_GUILD_CHANNEL)) !== 0;
}

function hasManageGuildChannel(permission: number) {
    return (permission & (1 << GUILD_PERMISSION.MANAGE_GUILD_CHANNELS)) !== 0;
}

function hasCreateChannelMessage(permission: number) {
    return (permission & (1 << GUILD_PERMISSION.CREATE_CHANNEL_MESSAGE)) !== 0;
}

function hasManageChannelMessage(permission: number) {
    return (permission & (1 << GUILD_PERMISSION.MANAGE_CHANNEL_MESSAGES)) !== 0;
}

function hasManageGuild(permission: number) {
    return (permission & (1 << GUILD_PERMISSION.MANAGE_GUILD)) !== 0;
}

function hasGuildAdmin(permission: number) {
    return (permission & (1 << GUILD_PERMISSION.GUILD_ADMIN)) !== 0;
}

function hasGuildSuperAdmin(permission: number) {
    return (permission & (1 << GUILD_PERMISSION.GUILD_SUPER_ADMIN)) !== 0;
}

function hasGuildOwner(permission: number) {
    return (permission & (1 << GUILD_PERMISSION.GUILD_OWNER)) !== 0;
}

function hasViewGuildMember(permission: number) {
    return (permission & (1 << GUILD_PERMISSION.VIEW_GUILD_MEMBERS)) !== 0;
}

function hasCreateChannelPin(permission: number) {
    return (permission & (1 << GUILD_PERMISSION.CREATE_CHANNEL_PIN)) !== 0;
}

export function generatePermissionsObj(permission: number) {
    if (permission === 0) {
        return {
            hasViewGuildChannel: false,
            hasManageGuildChannel: false,
            hasCreateChannelMessage: false,
            hasManageChannelMessage: false,
            hasManageGuild: false,
            hasGuildAdmin: false,
            hasGuildSuperAdmin: false,
            hasGuildOwner: false,
            hasViewGuildMember: false,
            hasCreateChannelPin: false,
        };
    }

    return {
        hasViewGuildChannel: hasViewGuildChannel(permission),
        hasManageGuildChannel: hasManageGuildChannel(permission),
        hasCreateChannelMessage: hasCreateChannelMessage(permission),
        hasManageChannelMessage: hasManageChannelMessage(permission),
        hasManageGuild: hasManageGuild(permission),
        hasGuildAdmin: hasGuildAdmin(permission),
        hasGuildSuperAdmin: hasGuildSuperAdmin(permission),
        hasGuildOwner: hasGuildOwner(permission),
        hasViewGuildMember: hasViewGuildMember(permission),
        hasCreateChannelPin: hasCreateChannelPin(permission),
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

        if (hasViewGuildChannel(guildRoles[channelRoleId].permissions)) {
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
