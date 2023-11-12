import { GuildChannel, PrivateChannel } from '../types';

export function IsGuildChannel(channel: GuildChannel | PrivateChannel): channel is GuildChannel {
  return (channel as GuildChannel).guildId !== undefined;
}

export function IsGuildChannelUpdate(
  channel:
    | Pick<GuildChannel, 'id' | 'name' | 'topic' | 'guildId'>
    | Pick<PrivateChannel, 'id' | 'name' | 'topic'>,
): channel is Pick<GuildChannel, 'id' | 'name' | 'topic' | 'guildId'> {
  return (channel as GuildChannel).guildId !== undefined;
}
