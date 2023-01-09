import { ChannelNotFound } from './ChannelNotFound';
import { usePrivateTextChannel } from './hooks/usePrivateTextChannel';
import { TextChannel } from './TextChannel';

export const PrivateChannel = () => {
  const privateTextChannel = usePrivateTextChannel();
  if (!privateTextChannel) {
    return <ChannelNotFound />;
  }
  const { channel, permissions } = privateTextChannel;
  return <TextChannel channel={channel} permissions={permissions} />;
};
