import { ErrChannelNotFound, ErrRoleNotFound } from "@/lib/error";
import { isGuildCategoryChannel } from "@/lib/types/guards";
import { GuildRoleType } from "@/lib/types/types";
import { useGuild } from "@/lib/zustand/stores/guild-store";

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
