import { GUILD_CHANNEL_TYPE, PRIVATE_CHANNEL_TYPE } from "../zod-validation/channel-schema";
import type {
    PrivateGroupChannelType,
    PrivateDirectChannelType,
    GuildCategoryChannelType,
    GuildChannelType,
    GuildTextChannelType,
    GuildVoiceChannelType,
    PrivateChannelType,
    Snapshot,
    APIGuildChannelType,
    APIPrivateChannelType,
} from "./types";

export function isGuildChannel(
    channel: Snapshot<GuildChannelType | PrivateChannelType>
): channel is Snapshot<GuildChannelType> {
    return channel.channelType < PRIVATE_CHANNEL_TYPE.PRIVATE_DIRECT_CHANNEL;
}
export function isAPIGuildChannel(
    channel: APIGuildChannelType | APIPrivateChannelType
): channel is APIGuildChannelType {
    return channel.channelType < PRIVATE_CHANNEL_TYPE.PRIVATE_DIRECT_CHANNEL;
}

export function isPrivateChannel(
    channel: Snapshot<GuildChannelType | PrivateChannelType>
): channel is Snapshot<PrivateChannelType> {
    return channel.channelType > GUILD_CHANNEL_TYPE.GUILD_CATEGORY_CHANNEL;
}

export function isAPIPrivateChannel(
    channel: APIGuildChannelType | APIPrivateChannelType
): channel is APIPrivateChannelType {
    return channel.channelType > GUILD_CHANNEL_TYPE.GUILD_CATEGORY_CHANNEL;
}

export function isGuildTextChannel(channel: Snapshot<GuildChannelType>): channel is Snapshot<GuildTextChannelType> {
    return channel.channelType === GUILD_CHANNEL_TYPE.GUILD_TEXT_CHANNEL;
}

export function isGuildVoiceChannel(channel: Snapshot<GuildChannelType>): channel is Snapshot<GuildVoiceChannelType> {
    return channel.channelType === GUILD_CHANNEL_TYPE.GUILD_VOICE_CHANNEL;
}

export function isGuildCategoryChannel(
    channel: Snapshot<GuildChannelType>
): channel is Snapshot<GuildCategoryChannelType> {
    return channel.channelType === GUILD_CHANNEL_TYPE.GUILD_CATEGORY_CHANNEL;
}

export function isPrivateDirectChannel(
    channel: Snapshot<PrivateChannelType>
): channel is Snapshot<PrivateDirectChannelType> {
    return channel.channelType === PRIVATE_CHANNEL_TYPE.PRIVATE_DIRECT_CHANNEL;
}

export function isPrivateGroupChannel(
    channel: Snapshot<PrivateChannelType>
): channel is Snapshot<PrivateGroupChannelType> {
    return channel.channelType === PRIVATE_CHANNEL_TYPE.PRIVATE_GROUP_CHANNEL;
}
