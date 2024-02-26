import { GuildChannel, PrivateChannel } from '../types';

export function IsGuildChannel(channel: GuildChannel | PrivateChannel): channel is GuildChannel {
    return (channel as GuildChannel).guildId !== undefined;
}

export function IsGuildChannelUpdate(
    channel: Pick<GuildChannel, 'id' | 'guildId'> | Pick<PrivateChannel, 'id'>,
): channel is Pick<GuildChannel, 'id' | 'guildId'> & Partial<Omit<GuildChannel, 'id' | 'guildId'>> {
    return (channel as GuildChannel).guildId !== undefined;
}
