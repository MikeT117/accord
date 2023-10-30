import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { Avatar } from '@/shared-components/Avatar';
import { IconButton } from '@/shared-components/IconButton';
import { DropdownMenu, DropdownMenuItem } from '@/shared-components/DropdownMenu';
import { ListItem } from '@/shared-components/ListItem';

export const GuildBanListItem = ({
  avatar,
  name,
  onUnbanMember,
}: {
  name: string;
  avatar?: string | null;
  onUnbanMember?: () => void;
}) => {
  return (
    <ListItem intent='secondary' isHoverable={false}>
      <Avatar size='md' src={avatar} className='mr-3' />
      <span className='mr-auto text-gray-12'>{name}</span>
      <DropdownMenu
        side='bottom'
        align='end'
        sideOffset={10}
        className='min-w-[180px]'
        tooltipText='Member actions'
        tooltipPosition='top'
        triggerElem={
          <IconButton padding='s' intent='secondary' className='ml-3'>
            <EllipsisVerticalIcon className='h-5 w-5 stroke-2' />
          </IconButton>
        }
      >
        <DropdownMenuItem onClick={onUnbanMember} fullWidth>
          <span className='whitespace-nowrap'>Revoke Ban</span>
        </DropdownMenuItem>
      </DropdownMenu>
    </ListItem>
  );
};
