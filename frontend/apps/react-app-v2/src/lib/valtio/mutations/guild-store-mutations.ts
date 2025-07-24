import { isGuildCategoryChannel } from "@/lib/types/guards";
import type {
    APIGuildType,
    APIGuildUpdatedType,
    APIGuildDeletedType,
    APIGuildChannelType,
    APIChannelUpdatedType,
    APIChannelDeletedType,
    APIGuildRoleType,
    APIGuildRoleUpdatedType,
} from "@/lib/types/types";
import { apiGuildChannelToGuildChannel } from "../mapper/api-guild-channel-mapper";
import { apiGuildToGuild } from "../mapper/api-guild-mapper";
import { guildStore } from "../stores/guild-store";

function resetGuildStore() {
    guildStore.keys = [];
    guildStore.values = {};
    guildStore.initialised = false;
}

export function handleGuildStoreInitialisation(guilds: APIGuildType[]) {
    if (guildStore.initialised) {
        resetGuildStore();
    }

    guilds.forEach((g) => {
        guildStore.keys.push(g.id);
        guildStore.values[g.id] = apiGuildToGuild(g);
    });

    guildStore.initialised = true;
}

export function handleGuildCreated(guild: APIGuildType) {
    guildStore.keys.push(guild.id);
    guildStore.values[guild.id] = apiGuildToGuild(guild);
}

export function handleGuildUpdated(guildUpdate: APIGuildUpdatedType) {
    const guild = guildStore.values[guildUpdate.id];
    if (!guild) {
        return;
    }

    guild.banner = guildUpdate.banner;
    guild.channelCount = guildUpdate.channelCount;
    guild.description = guildUpdate.description;
    guild.discoverable = guildUpdate.discoverable;
    guild.guildCategoryId = guildUpdate.guildCategoryId;
    guild.icon = guildUpdate.icon;
    guild.memberCount = guildUpdate.memberCount;
    guild.name = guildUpdate.name;
    guild.updatedAt = guildUpdate.updatedAt;
}

export function handleGuildDeleted(guildDelete: APIGuildDeletedType) {
    delete guildStore.values[guildDelete.id];
}

export function handleGuildChannelCreated(channel: APIGuildChannelType) {
    const guild = guildStore.values[channel.guildId];
    if (!guild) {
        return;
    }

    guild.channels.keys.push(channel.id);
    guild.channels.values[channel.id] = apiGuildChannelToGuildChannel(channel);
}

export function handleGuildChannelUpdated(channelUpdate: APIChannelUpdatedType) {
    const guild = guildStore.values[channelUpdate.guildId];
    if (!guild) {
        return;
    }

    const channel = guild.channels.values[channelUpdate.id];
    if (!channel) {
        return;
    }

    if (!isGuildCategoryChannel(channel)) {
        channel.parentId = channelUpdate.parentId;
    }

    channel.name = channelUpdate.name;
    channel.topic = channelUpdate.topic;
    channel.updatedAt = channelUpdate.updatedAt;
}

export function handleGuildChannelDeleted(channelDelete: APIChannelDeletedType) {
    const guild = guildStore.values[channelDelete.guildId];

    if (!guild) {
        return;
    }

    const index = guild.channels.keys.findIndex((c) => c === channelDelete.id);
    if (index === -1) {
        return;
    }

    guild.channels.keys.splice(index, 1);
    delete guild.channels.values[channelDelete.id];
}

export function handleGuildRoleCreated(role: APIGuildRoleType) {
    const guild = guildStore.values[role.guildId];
    if (!guild) {
        return;
    }

    guild.roles.keys.push(role.id);
    guild.roles.values[role.id] = role;
}

export function handleGuildRoleUpdated(roleUpdate: APIGuildRoleUpdatedType) {
    const guild = guildStore.values[roleUpdate.guildId];
    if (!guild) {
        return;
    }

    const role = guild.roles.values[roleUpdate.id];
    if (!role) {
        return;
    }

    role.name = roleUpdate.name;
    role.permissions = roleUpdate.permissions;
    role.updatedAt = roleUpdate.updatedAt;
}

export function handleChannelRoleAdded(guildId: string, chnanelId: string, roleId: string) {
    const guild = guildStore.values[guildId];
    if (!guild) {
        return;
    }

    const channel = guild.channels.values[chnanelId];
    if (!channel) {
        return;
    }

    channel.roleIds.keys.push(roleId);
    channel.roleIds.values[roleId] = true;
}

export function handleChannelRoleRemoved(guildId: string, channelId: string, roleId: string) {
    const guild = guildStore.values[guildId];
    if (!guild) {
        return;
    }

    const channel = guild.channels.values[channelId];
    if (!channel) {
        return;
    }

    const index = channel.roleIds.keys.findIndex((c) => c === roleId);
    if (index === -1) {
        return;
    }

    channel.roleIds.keys.splice(index, 1);
    delete channel.roleIds.values[roleId];
}

export function handleGuildRoleDeleted(roleDelete: APIChannelDeletedType) {
    const guild = guildStore.values[roleDelete.guildId];
    if (!guild) {
        return;
    }

    const role = guild.roles.values[roleDelete.id];
    if (!role) {
        return;
    }

    const index = guild.roles.keys.findIndex((r) => r === roleDelete.id);
    if (!index) {
        return;
    }

    guild.roles.keys.splice(index, 1);
    delete guild.roles.values[roleDelete.id];
}
