import { isChannelViewable } from "@/lib/authorisation/permissions";
import { isGuildCategoryChannel } from "@/lib/types/guards";
import { GuildCategoryChannelType, GuildTextChannelType, GuildVoiceChannelType } from "@/lib/types/types";
import { useGuildWithPermissions } from "@/lib/zustand/stores/guild-store";
import { useUserRoleStore } from "@/lib/zustand/stores/user-role-store";
import { useUser } from "@/lib/zustand/stores/user-store";

export function useGuildSidebarState(guildId: string) {
    const { guild, permissions } = useGuildWithPermissions(guildId);
    const user = useUser();
    const userRoles = useUserRoleStore((s) => s.values);

    const parents: GuildCategoryChannelType[] = [];
    const children: (GuildTextChannelType | GuildVoiceChannelType)[] = [];
    const orphans: (GuildTextChannelType | GuildVoiceChannelType)[] = [];

    for (let i = 0; i < guild.channels.keys.length; i++) {
        const channel = guild.channels.values[guild.channels.keys[i]];
        if (!channel) {
            continue;
        }

        if (!isChannelViewable(channel.roleIds.keys, userRoles, guild.roles.values)) {
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
                guild.channels.values[channel.parentId]?.roleIds.keys ?? [],
                userRoles,
                guild.roles.values,
            )
        ) {
            orphans.push(channel);
            continue;
        }

        children.push(channel);
    }

    return { guild, permissions, user, parents, children, orphans };
}
