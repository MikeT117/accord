import { Channel } from '@accord/common';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { useCallback } from 'react';
import { Dialog } from '@/shared-components/Dialog';
import { FullscreenSettingsContentLayout } from '@/shared-components/FullscreenSettings';
import { IconButton } from '@/shared-components/IconButton';
import { actionConfirmationStore } from '@/components/ActionConfirmation';
import { ChannelOverview } from './ChannelOverview';
import { ChannelPermissions } from './ChannelPermissions';
import { ChannelPermissionsRolesSidebar } from './ChannelPermissionsRolesSidebar';
import { ChannelSettingsSidebar } from './ChannelSettingsSidebar';
import {
  channelSettingsStore,
  CHANNEL_OVERVIEW,
  CHANNEL_ROLES,
  useChannelSettingsStore,
} from './stores/useChannelSettingsStore';
import { useChanneSettings } from './hooks/useChannelSettings';
import { useUpdateChannelMutation } from '@/api/channel/updateChannel';
import { useDeleteChannelMutation } from '@/api/channel/deleteChannel';
import { useAssignGuildChannelToRoleMutation } from '@/api/role/assignGuildChannelToRole';
import { useSyncGuildChannelRolesWithParentMutation } from '@/api/role/syncGuildChannelRolesWithParent';
import { useUnassignGuildChannelFromRoleMutation } from '@/api/role/unassignGuildChannelFromRole';
import { AccordError } from '../../shared-components/AccordError';

export const ChannelSettingsContent = () => {
  const channelSettingsState = useChanneSettings();

  const { mutate: updateChannel } = useUpdateChannelMutation();
  const { mutate: deleteChannel } = useDeleteChannelMutation();
  const { mutate: assignRole } = useAssignGuildChannelToRoleMutation();
  const { mutate: syncParentRoles } = useSyncGuildChannelRolesWithParentMutation();
  const { mutate: unassignRole } = useUnassignGuildChannelFromRoleMutation();

  if (!channelSettingsState) {
    return <AccordError />;
  }

  const {
    channel: { id, guildId, topic, name, type, parentId, parentRoleSync, isPrivate },
    section,
    assignedRoles,
    defaultRole,
    unassignedRoles,
  } = channelSettingsState;

  const handleGuildChannelDelete = () => {
    actionConfirmationStore.setChannel({ id, name, type, guildId }, () => {
      channelSettingsStore.toggleOpen();
      deleteChannel({ id, type, guildId });
    });
  };

  const handleGuildChannelUpdate = (updatedChannel: Pick<Channel, 'name' | 'topic'>) => {
    updateChannel({
      id,
      type,
      guildId,
      ...updatedChannel,
    });
  };

  const handleGuildChannelRoleAssign = (roleId: string) => {
    assignRole({ channelId: id, guildId, roleId });
  };

  const handleGuildChannelRoleUnassign = (roleId: string) => {
    unassignRole({ guildId, channelId: id, roleId });
  };

  const handleGuildChannelParentRoleSync = () => {
    syncParentRoles({ guildId, channelId: id });
  };

  return (
    <>
      <ChannelSettingsSidebar
        name={name}
        type={type}
        settingsSection={section}
        onDelete={handleGuildChannelDelete}
      />
      <FullscreenSettingsContentLayout>
        <IconButton
          className='absolute right-0 top-12'
          onClick={channelSettingsStore.toggleOpen}
          intent='secondary'
        >
          <XMarkIcon className='h-5 w-5' />
        </IconButton>
        {section === CHANNEL_OVERVIEW && (
          <ChannelOverview
            name={name}
            type={type}
            topic={topic}
            onChannelUpdate={handleGuildChannelUpdate}
          />
        )}
        {section === CHANNEL_ROLES && (
          <div className='flex h-full'>
            <ChannelPermissionsRolesSidebar
              unassignedRoles={unassignedRoles}
              onAssignGuildChannelRole={handleGuildChannelRoleAssign}
            />
            <ChannelPermissions
              parentId={parentId}
              type={type}
              parentRoleSync={parentRoleSync}
              isPrivate={isPrivate}
              assignedRoles={assignedRoles}
              defaultRole={defaultRole}
              onAssignGuildChannelRole={handleGuildChannelRoleAssign}
              onSyncGuildChannelRoles={handleGuildChannelParentRoleSync}
              onUnassignGuildChannelRole={handleGuildChannelRoleUnassign}
            />
          </div>
        )}
      </FullscreenSettingsContentLayout>
    </>
  );
};

export const ChannelSettings = () => {
  const isOpen = useChannelSettingsStore(useCallback((s) => s.isOpen, []));
  return (
    <Dialog
      isOpen={isOpen}
      onClose={channelSettingsStore.toggleOpen}
      size='screen'
      className='flex'
    >
      <ChannelSettingsContent />
    </Dialog>
  );
};
