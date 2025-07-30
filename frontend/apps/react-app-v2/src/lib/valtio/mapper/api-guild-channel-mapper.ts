import type { APIGuildChannelType, GuildChannelType, Normalize } from "@/lib/types/types";

export function apiGuildChannelToGuildChannel(channel: APIGuildChannelType): GuildChannelType {
    const roleIds: Normalize<boolean> = {
        keys: [],
        values: {},
    };

    channel.roleIds.forEach((r) => {
        roleIds.keys.push(r);
        roleIds.values[r] = true;
    });

    return { ...channel, roleIds };
}
