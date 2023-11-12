import { GuildChannel, PrivateChannel } from '../../types';
import { Header } from './Header';
import { MessageCreator } from './MessageCreator';
import { MessagesList } from './MessagesList';
import { PinnedMessagesPopover, PinnedMessagesPopoverContent } from './PinnedMessages';

export const TextChannel = ({
  channel,
  permissions,
}: {
  channel: GuildChannel | PrivateChannel;
  permissions: number;
}) => {
  return (
    <>
      <Header name={channel.name} type={channel.channelType}>
        <PinnedMessagesPopover align='end' side='bottom' sideOffset={6}>
          <PinnedMessagesPopoverContent channelId={channel.id} permissions={permissions} />
        </PinnedMessagesPopover>
      </Header>
      <MessagesList channelId={channel.id} permissions={permissions} />
      <MessageCreator permissions={permissions} />
    </>
  );
};
