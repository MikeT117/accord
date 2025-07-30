import type { APIGuildType, GuildType, Normalize, GuildChannelType, GuildRoleType } from "@/lib/types/types";
import { apiGuildChannelToGuildChannel } from "./api-guild-channel-mapper";

export function apiGuildToGuild(guild: APIGuildType): GuildType {
    const channels: Normalize<GuildChannelType> = {
        keys: [],
        values: {},
    };

    guild.channels.forEach((c) => {
        channels.keys.push(c.id);
        channels.values[c.id] = apiGuildChannelToGuildChannel(c);
    });

    const roles: Normalize<GuildRoleType> = {
        keys: [],
        values: {},
    };

    guild.roles.forEach((r) => {
        roles.keys.push(r.id);
        roles.values[r.id] = r;
    });

    return { ...guild, channels, roles };
}
