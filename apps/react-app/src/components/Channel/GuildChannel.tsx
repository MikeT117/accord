import { ChannelNotFound } from './ChannelNotFound';
import { useGuildTextChannel } from './hooks/useGuildTextChannel';
import { TextChannel } from './TextChannel';

export const GuildChannel = () => {
  const guildTextChannel = useGuildTextChannel();
  if (!guildTextChannel) {
    return <ChannelNotFound />;
  }
  const { channel, permissions } = guildTextChannel;
  return <TextChannel channel={channel} permissions={permissions} />;
};
