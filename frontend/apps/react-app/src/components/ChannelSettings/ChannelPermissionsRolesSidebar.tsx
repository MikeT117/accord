import { PlusCircleIcon } from '@heroicons/react/24/solid';
import { DefaultTooltip } from '@/shared-components/DefaultTooltip';
import { ListItem } from '@/shared-components/ListItem';
import { GuildRole } from '../../types';

export const ChannelPermissionsRolesSidebar = ({
  onAssignGuildChannelRole,
  unassignedRoles,
}: {
  onAssignGuildChannelRole: (guildRoleId: string) => void;
  unassignedRoles: GuildRole[];
}) => (
  <div className='flex h-full basis-[260px] flex-col border-r border-black px-4 pt-12'>
    <h1 className='mb-4 font-semibold text-gray-12'>Server Roles</h1>
    <ul className='space-y-1 overflow-y-scroll'>
      {unassignedRoles.map((r) => (
        <DefaultTooltip key={r.id} tootipText='Asign Role' delayDuration={100}>
          <ListItem
            intent='secondary'
            className='transition-colors hover:text-gray-12'
            onClick={() => onAssignGuildChannelRole(r.id)}
            isActionable
          >
            <span className='w-0 min-w-[90%] truncate'>{r.name}</span>
            <PlusCircleIcon className='h-5 w-5 shrink-0' />
          </ListItem>
        </DefaultTooltip>
      ))}
    </ul>
  </div>
);
