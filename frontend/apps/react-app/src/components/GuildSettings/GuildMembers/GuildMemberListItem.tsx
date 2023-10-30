import { EllipsisVerticalIcon, BoltIcon } from '@heroicons/react/24/outline';
import { Avatar } from '@/shared-components/Avatar';
import { IconButton } from '@/shared-components/IconButton';
import { DropdownMenu, DropdownMenuItem } from '@/shared-components/DropdownMenu';
import { ListItem } from '@/shared-components/ListItem';
import { GuildMemberRolesList } from './GuildMemberRolesList';
import { DefaultTooltip } from '@/shared-components/DefaultTooltip';

export const GuildMemberListItem = ({
  guildId,
  isCurrentUser,
  isOwner,
  avatar,
  roles,
  name,
  onBanMember,
  onKickMember,
}: {
  guildId: string;
  isCurrentUser: boolean;
  isOwner: boolean;
  name: string;
  avatar?: string | null;
  roles: string[];
  onKickMember?: () => void;
  onBanMember?: () => void;
}) => {
  return (
    <ListItem intent='secondary' isHoverable={false}>
      <Avatar size='md' src={avatar} className='mr-3' />
      <div className='flex min-w-[180px] items-center space-x-2'>
        <span className='leading-none text-gray-12'>{name}</span>
        {isOwner && (
          <DefaultTooltip tootipText='Server Owner'>
            <BoltIcon className='h-4 w-4 stroke-yellow-9' />
          </DefaultTooltip>
        )}
      </div>
      <GuildMemberRolesList guildId={guildId} roles={roles} />
      {!isOwner && !isCurrentUser && (
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
          <>
            <DropdownMenuItem onClick={onBanMember} fullWidth intent='danger'>
              <span className='whitespace-nowrap'>Ban {name}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onKickMember} fullWidth intent='danger'>
              <span className='whitespace-nowrap'>Kick {name}</span>
            </DropdownMenuItem>
          </>
        </DropdownMenu>
      )}
    </ListItem>
  );
};
