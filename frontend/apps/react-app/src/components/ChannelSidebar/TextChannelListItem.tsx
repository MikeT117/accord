import { useDrag } from 'react-dnd';
import { HashtagIcon } from '@heroicons/react/24/outline';
import { ListItem } from '@/shared-components/ListItem';
import { GuildChannelContextMenu } from './GuildChannelContextMenu';
import { GuildChannel } from '../../types';

export const GuildTextChannelListItem = ({
  channel,
  isActive,
  onClick,
  onDelete,
  onSettings,
}: {
  channel: GuildChannel;
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
      channelType={channel.channelType}
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
