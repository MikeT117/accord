import { GuildRole, GuildTextChannel, PrivateChannel } from '@accord/common';
import { Header } from './Header';
import { MessageCreator } from './MessageCreator';
import { MessagesList } from './MessagesList';
import { PinnedMessagesPopover, PinnedMessagesPopoverContent } from './PinnedMessages';

export const TextChannel = ({
  channel: { id, name, type },
  permissions,
}: {
  channel:
    | Pick<GuildTextChannel, 'id' | 'name' | 'type'>
    | Pick<PrivateChannel, 'id' | 'name' | 'type'>;
  permissions: Omit<GuildRole, 'id' | 'name' | 'guildId'>;
}) => {
  return (
    <>
      <Header name={name} type={type}>
        <PinnedMessagesPopover align='end' side='bottom' sideOffset={6}>
          <PinnedMessagesPopoverContent channelId={id} permissions={permissions} />
        </PinnedMessagesPopover>
      </Header>
      <MessagesList channelId={id} permissions={permissions} />
      <MessageCreator permissions={permissions} />
    </>
  );
};
