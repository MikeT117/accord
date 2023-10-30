import { TrashIcon } from '@heroicons/react/24/solid';
import { ClipboardIcon } from '@heroicons/react/24/outline';
import { DefaultTooltip } from '@/shared-components/DefaultTooltip';
import { Avatar } from '@/shared-components/Avatar';
import { IconButton } from '@/shared-components/IconButton';
import { ListItem } from '@/shared-components/ListItem';

export const GuildInviteListItem = ({
  creatorName,
  id,
  usedCount,
  creatorAvatar,
  onDelete,
  onCopy,
}: {
  creatorAvatar?: string | null;
  creatorName: string;
  id: string;
  usedCount: number;
  onCopy: () => void;
  onDelete: () => void;
}) => {
  return (
    <ListItem intent='secondary' className='justify-between'>
      <div className='flex w-[120px] items-center space-x-2 whitespace-nowrap'>
        <Avatar src={creatorAvatar} size='md' />
        <span className='overflow-ellipsis font-semibold text-gray-12'>{creatorName}</span>
      </div>
      <span className='w-[320px] whitespace-nowrap font-medium text-gray-11'>{id}</span>
      <span className='font-semibold text-gray-12'>{usedCount}</span>
      <div className='flex space-x-2'>
        <DefaultTooltip tootipText='Copy Code' position='top'>
          <IconButton onClick={onCopy} padding='m' intent='secondary'>
            <ClipboardIcon className='h-4 w-4 stroke-2' />
          </IconButton>
        </DefaultTooltip>
        <DefaultTooltip tootipText='Delete Invite' position='top'>
          <IconButton intent='danger' padding='m' onClick={onDelete}>
            <TrashIcon className='h-4 w-4' />
          </IconButton>
        </DefaultTooltip>
      </div>
    </ListItem>
  );
};
