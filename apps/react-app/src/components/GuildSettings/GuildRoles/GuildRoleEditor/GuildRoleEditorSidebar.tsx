import { GuildRole } from '@accord/common';
import { ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useCreateRoleMutation } from '@/api/role/createRole';
import { Button } from '@/shared-components/Button';
import { DefaultTooltip } from '@/shared-components/DefaultTooltip';
import { IconButton } from '@/shared-components/IconButton';
import { ListItem } from '@/shared-components/ListItem';
import { guildSettingsActions, GUILD_ROLES } from '../../stores/useGuildSettingsStore';

const { setSection, setRole } = guildSettingsActions;

export const GuildRoleEditorSidebar = ({
  guildId,
  currentRoleId,
  editableRoles,
}: {
  guildId: string;
  editableRoles: GuildRole[];
  currentRoleId?: string;
}) => {
  const { mutate: createRole } = useCreateRoleMutation();

  return (
    <div className='flex h-full basis-[260px] flex-col border-r border-black px-4 pt-12'>
      <div className='mb-4 flex items-center justify-between'>
        <DefaultTooltip tootipText='Back to Overview' delayDuration={100}>
          <Button
            intent='link'
            className='space-x-2'
            onClick={() => setSection(GUILD_ROLES)}
            padding='none'
          >
            <ArrowLeftIcon className='h-5 w-5' />
            <span className='font-semibold'>Back</span>
          </Button>
        </DefaultTooltip>
        <DefaultTooltip tootipText='Create New Role' delayDuration={100}>
          <IconButton intent='secondary' padding='xs' onClick={() => createRole({ guildId })}>
            <PlusIcon className='h-5 w-5' />
          </IconButton>
        </DefaultTooltip>
      </div>
      <ul className='space-y-1 overflow-y-scroll'>
        {editableRoles.map((r) => (
          <ListItem
            key={r.id}
            intent='secondary'
            baseBg={false}
            isActive={r.id === currentRoleId}
            onClick={() => setRole(r.id)}
            isActionable
          >
            <span className='w-0 min-w-[100%] truncate'>{r.name}</span>
          </ListItem>
        ))}
      </ul>
    </div>
  );
};
