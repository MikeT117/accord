import { useDrag } from 'react-dnd';
import type { GuildTextChannel } from '@accord/common';
import { HashtagIcon } from '@heroicons/react/24/outline';
import { ListItem } from '@/shared-components/ListItem';
import { GuildChannelContextMenu } from './GuildChannelContextMenu';

export const GuildTextChannelListItem = ({
  channel,
  isActive,
  onClick,
  onDelete,
  onSettings,
}: {
  channel: GuildTextChannel;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
  onSettings: () => void;
}) => {
  const [_, dragRef] = useDrag(
    () => ({
      type: 'GUILD_CHANNEL',
      item: channel,
    }),
    [],
  );

  return (
    <GuildChannelContextMenu
      id={channel.id}
      type={channel.channelType}
      onDelete={onDelete}
      onSettings={onSettings}
    >
      <ListItem
        ref={dragRef}
        isActive={isActive}
        onClick={onClick}
        intent='secondary'
        baseBg={false}
        isActionable
      >
        <HashtagIcon className='h-4 w-4 stroke-2' />
        <span className='ml-1 text-sm'>{channel.name}</span>
      </ListItem>
    </GuildChannelContextMenu>
  );
};
