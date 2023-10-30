import { GuildTextChannel, PrivateTextChannel } from '@accord/common';
import { Header } from './Header';
import { MessageCreator } from './MessageCreator';
import { MessagesList } from './MessagesList';
import { PinnedMessagesPopover, PinnedMessagesPopoverContent } from './PinnedMessages';

export const TextChannel = ({
  channel,
  permissions,
}: {
  channel: GuildTextChannel | PrivateTextChannel;
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
