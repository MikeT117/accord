import { isGuildCategoryChannel, isGuildTextChannel, isGuildVoiceChannel } from "@/lib/types/guards";
import type {
    GuildCategoryChannelType,
    GuildRoleType,
    GuildTextChannelType,
    GuildVoiceChannelType,
    Snapshot,
} from "@/lib/types/types";
import { useSnapshot } from "valtio";
import { guildStore } from "../stores/guild-store";
import { userRoleStore } from "../stores/user-roles-store";
import { isChannelViewable } from "@/lib/authorisation/permissions";
import { ErrChannelNotFound, ErrServerNotFound } from "@/lib/error";

export function useGuild(guildId: string) {
    const guildStoreSnapshot = useSnapshot(guildStore);
    const guild = guildStoreSnapshot.values[guildId];
    if (!guild) throw new ErrServerNotFound();

    return guild;
}

export function useGuilds() {
    const guildStoreSnapshot = useSnapshot(guildStore);
    return guildStoreSnapshot.keys.map((k) => guildStoreSnapshot.values[k]!);
}

export function useGuildChannel(guildId: string, channelId: string) {
    const guild = useGuild(guildId);
    const userRoleStoreSnapshot = useSnapshot(userRoleStore);

    const channel = guild.channels.values[channelId];
    if (!channel) throw new ErrChannelNotFound();

    if (!isChannelViewable(channel.roleIds.keys, userRoleStoreSnapshot.values, guild.roles.values)) {
        throw new ErrChannelNotFound();
    }

    return channel;
}

export function useGuildTextChannel(guildId: string, channelId: string) {
    const channel = useGuildChannel(guildId, channelId);
    if (!channel) throw new ErrChannelNotFound();
    if (!isGuildTextChannel(channel)) throw new ErrChannelNotFound();

    return channel;
}

export function useGuildCategoryChannel(guildId: string, channelId: string) {
    const channel = useGuildChannel(guildId, channelId);
    if (!channel) throw new ErrChannelNotFound();
    if (!isGuildCategoryChannel(channel)) throw new ErrChannelNotFound();

    return channel;
}

export function useGuildVoiceChannel(guildId: string, channelId: string) {
    const channel = useGuildChannel(guildId, channelId);
    if (!channel) throw new ErrChannelNotFound();
    if (!isGuildVoiceChannel(channel)) throw new ErrChannelNotFound();

    return channel;
}

export function useGuildRoles(guildId: string) {
    const guild = useGuild(guildId);
    return guild.roles.keys.map((k) => guild.roles.values[k]!);
}

export function useCustomGuildRoles(guildId: string) {
    const guild = useGuild(guildId);
    const roles: GuildRoleType[] = [];
    guild.roles.keys.forEach((k) => {
        if (!guild.roles.values[k]!.name.includes("@")) {
            roles.push(guild.roles.values[k]!);
        }
    });

    return roles;
}

export function useSortedGuildChannels(guildId: string) {
    const guild = useGuild(guildId);
    const userRoleStoreSnapshot = useSnapshot(userRoleStore);

    const parents: Snapshot<GuildCategoryChannelType>[] = [];
    const children: Snapshot<GuildTextChannelType | GuildVoiceChannelType>[] = [];
    const orphans: Snapshot<GuildTextChannelType | GuildVoiceChannelType>[] = [];

    for (let i = 0; i < guild.channels.keys.length; i++) {
        const channel = guild.channels.values[guild.channels.keys[i]];
        if (!channel) continue;

        if (!isChannelViewable(channel.roleIds.keys, userRoleStoreSnapshot.values, guild.roles.values)) {
            continue;
        }

        if (isGuildCategoryChannel(channel)) {
            parents.push(channel);
            continue;
        }

        if (!channel.parentId || !guild.channels.values[channel.parentId]) {
            orphans.push(channel);
            continue;
        }

        if (
            !isChannelViewable(
                guild.channels.values[channel.parentId]!.roleIds.keys,
                userRoleStoreSnapshot.values,
                guild.roles.values
            )
        ) {
            orphans.push(channel);
            continue;
        }

        children.push(channel);
    }

    return { parents, children, orphans };
}
