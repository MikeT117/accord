import { Button } from '@/shared-components/Button';
import { ListItem } from '@/shared-components/ListItem';
import { Popover } from '@/shared-components/Popover';
import { Pip } from '../../../shared-components/Pip';
import { useGuildMemberRoles } from '../hooks/useGuildMemberRoles';
import { useOverflowedGuildRoles } from './hooks/useOverflowedGuildRoles';

export const GuildMemberRolesList = ({ guildId, roles }: { guildId: string; roles: string[] }) => {
  const guildRoles = useGuildMemberRoles(guildId, roles);
  const { overflowed, ref, overflowedCount } = useOverflowedGuildRoles(guildRoles);

  return (
    <div className='flex max-w-[350px] flex-row space-x-1' ref={ref}>
      {guildRoles
        .filter((gr) => !overflowed.includes(gr.id))
        .map((gr) => (
          <Pip key={gr.id}>{gr.name}</Pip>
        ))}
      {overflowedCount !== 0 && (
        <Popover
          className='p-1.5'
          triggerElem={
            <Button intent='unstyled' padding='none'>
              <Pip>+{overflowedCount}</Pip>
            </Button>
          }
          tooltipText='All Roles'
        >
          <h1 className='mb-3 text-xs font-semibold text-gray-12'>Assigned Roles</h1>
          <ul className='space-y-1 rounded-md'>
            {guildRoles.map((gr) => (
              <ListItem key={gr.id} intent='success'>
                <span className='text-xs'>{gr.name}</span>
              </ListItem>
            ))}
          </ul>
        </Popover>
      )}
    </div>
  );
};
