import { Cog6ToothIcon, TrashIcon } from '@heroicons/react/20/solid';
import { ReactNode } from 'react';
import { ContextMenu, ContextMenuItem } from '@/shared-components/ContextMenu';
import { useChannelPermissions } from './hooks/useChannelPermissions';
import { GUILD_ADMIN, MANAGE_GUILD, MANAGE_GUILD_CHANNELS } from '../../constants';

export const GuildChannelContextMenu = ({
  id,
  type,
  children,
  onSettings,
  onDelete,
}: {
  id: string;
  type: 0 | 1 | 4;
  children: ReactNode;
  onSettings: () => void;
  onDelete: () => void;
}) => {
  const permissions = useChannelPermissions(id);
  const manageGuild = (permissions & (1 << MANAGE_GUILD)) !== 0;
  const manageGuildChannels = (permissions & (1 << MANAGE_GUILD_CHANNELS)) !== 0;
  const guildAdmin = (permissions & (1 << GUILD_ADMIN)) !== 0;
  return (
    <ContextMenu tiggerElem={children} className='min-w-[180px]'>
      {(manageGuild || manageGuildChannels || guildAdmin) && (
        <ContextMenuItem onClick={onSettings} fullWidth>
          <span className='mr-2 text-sm'>{type === 1 ? 'Category' : 'Channel'} Settings</span>
          <Cog6ToothIcon className='ml-auto h-4 w-4' />
        </ContextMenuItem>
      )}
      {(manageGuild || manageGuildChannels || guildAdmin) && (
        <ContextMenuItem intent='danger' onClick={onDelete} fullWidth>
          <span className='mr-2 text-sm'>Delete {type === 1 ? 'Category' : 'Channel'}</span>
          <TrashIcon className='ml-auto h-4 w-4' />
        </ContextMenuItem>
      )}
    </ContextMenu>
  );
};
