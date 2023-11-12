import { TrashIcon } from '@heroicons/react/24/solid';
import { Avatar } from '@/shared-components/Avatar';
import { Checkbox } from '@/shared-components/Checkbox';
import { DefaultTooltip } from '@/shared-components/DefaultTooltip';
import { ListItem } from '@/shared-components/ListItem';
import { IconButton } from '@/shared-components/IconButton';
import { User } from '../../types';

export const GuildMemberListItem = ({
  user,
  selected,
  isEditable,
  onToggleSelect,
  onDeleteClick,
}: {
  user: Pick<User, 'id' | 'displayName' | 'avatar'>;
  selected?: boolean;
  isEditable?: boolean;
  onToggleSelect?: () => void;
  onDeleteClick?: () => void;
}) => {
  return (
    <ListItem onClick={onToggleSelect} intent='secondary' isHoverable={false}>
      <Avatar src={user.avatar} className='h-[32px] w-[32px]' />
      <span className='mx-3 mr-auto select-none text-sm'>{user.displayName}</span>
      {typeof onToggleSelect === 'function' && <Checkbox isChecked={selected ?? false} />}
      {isEditable && typeof onDeleteClick === 'function' && (
        <DefaultTooltip tootipText='Unassign from Role' position='top'>
          <IconButton intent='danger' padding='m' onClick={onDeleteClick}>
            <TrashIcon className='h-4 w-4' />
          </IconButton>
        </DefaultTooltip>
      )}
    </ListItem>
  );
};
