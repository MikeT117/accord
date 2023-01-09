import { useDrag } from 'react-dnd';
import type { GuildTextChannel } from '@accord/common';
import { HashtagIcon } from '@heroicons/react/24/outline';
import { ListItem } from '@/shared-components/ListItem';
import { ChannelContextMenu } from './ChannelContextMenu';

export const TextChannelListItem = ({
  id,
  name,
  type,
  guildId,
  parentId,
  isActive,
  onClick,
  onDelete,
  onSettings,
}: Pick<GuildTextChannel, 'id' | 'name' | 'guildId' | 'parentId' | 'type'> & {
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
  onSettings: () => void;
}) => {
  const [_, dragRef] = useDrag(
    () => ({
      type: 'GUILD_CHANNEL',
      item: { id, guildId, type, parentId },
    }),
    [],
  );

  return (
    <ChannelContextMenu type={type} id={id} onDelete={onDelete} onSettings={onSettings}>
      <ListItem
        ref={dragRef}
        isActive={isActive}
        onClick={onClick}
        intent='secondary'
        baseBg={false}
        isActionable
      >
        <HashtagIcon className='h-4 w-4 stroke-2' />
        <span className='ml-1 text-sm'>{name}</span>
      </ListItem>
    </ChannelContextMenu>
  );
};
