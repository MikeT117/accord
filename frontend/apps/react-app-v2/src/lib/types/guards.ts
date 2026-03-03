import type { AxiosError } from "axios";
import { GUILD_CHANNEL_TYPE, PRIVATE_CHANNEL_TYPE } from "../zod-validation/channel-schema";
import type {
    PrivateGroupChannelType,
    PrivateDirectChannelType,
    GuildCategoryChannelType,
    GuildChannelType,
    GuildTextChannelType,
    GuildVoiceChannelType,
    PrivateChannelType,
    APIGuildChannelType,
    APIPrivateChannelType,
} from "./types";

export function isGuildChannel(channel: GuildChannelType | PrivateChannelType): channel is GuildChannelType {
    return channel.channelType < PRIVATE_CHANNEL_TYPE.PRIVATE_DIRECT_CHANNEL;
}
export function isAPIGuildChannel(
    channel: APIGuildChannelType | APIPrivateChannelType,
): channel is APIGuildChannelType {
    return channel.channelType < PRIVATE_CHANNEL_TYPE.PRIVATE_DIRECT_CHANNEL;
}

export function isPrivateChannel(channel: GuildChannelType | PrivateChannelType): channel is PrivateChannelType {
    return channel.channelType > GUILD_CHANNEL_TYPE.GUILD_CATEGORY_CHANNEL;
}

export function isAPIPrivateChannel(
    channel: APIGuildChannelType | APIPrivateChannelType,
): channel is APIPrivateChannelType {
    return channel.channelType > GUILD_CHANNEL_TYPE.GUILD_CATEGORY_CHANNEL;
}

export function isGuildTextChannel(channel: GuildChannelType): channel is GuildTextChannelType {
    return channel.channelType === GUILD_CHANNEL_TYPE.GUILD_TEXT_CHANNEL;
}

export function isGuildVoiceChannel(channel: GuildChannelType): channel is GuildVoiceChannelType {
    return channel.channelType === GUILD_CHANNEL_TYPE.GUILD_VOICE_CHANNEL;
}

export function isGuildCategoryChannel(channel: GuildChannelType): channel is GuildCategoryChannelType {
    return channel.channelType === GUILD_CHANNEL_TYPE.GUILD_CATEGORY_CHANNEL;
}

export function isPrivateDirectChannel(channel: PrivateChannelType): channel is PrivateDirectChannelType {
    return channel.channelType === PRIVATE_CHANNEL_TYPE.PRIVATE_DIRECT_CHANNEL;
}

export function isPrivateGroupChannel(channel: PrivateChannelType): channel is PrivateGroupChannelType {
    return channel.channelType === PRIVATE_CHANNEL_TYPE.PRIVATE_GROUP_CHANNEL;
}

export function isAxiosError(error: Error): error is AxiosError {
    return error.name === "AxiosError";
}
