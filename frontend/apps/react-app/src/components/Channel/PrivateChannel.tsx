import { ChannelNotFound } from './ChannelNotFound';
import { usePrivateTextChannel } from './hooks/usePrivateTextChannel';
import { TextChannel } from './TextChannel';

export const PrivateChannel = () => {
  const privateTextChannel = usePrivateTextChannel();

  if (!privateTextChannel) {
    return <ChannelNotFound />;
  }

  return (
    <TextChannel
      channel={privateTextChannel.channel}
      permissions={privateTextChannel.permissions}
    />
  );
};
