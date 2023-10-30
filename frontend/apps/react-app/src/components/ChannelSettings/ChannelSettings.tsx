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
import { useUpdateGuildChannelMutation } from '@/api/channel/updateGuildChannel';
import { useDeleteGuildChannelMutation } from '@/api/channel/deleteGuildChannel';
import { useAssignGuildChannelToRoleMutation } from '@/api/role/assignGuildChannelToRole';
import { useSyncGuildChannelRolesWithParentMutation } from '@/api/role/syncGuildChannelRolesWithParent';
import { useUnassignGuildChannelFromRoleMutation } from '@/api/role/unassignGuildChannelFromRole';
import { AccordError } from '../../shared-components/AccordError';

export const ChannelSettingsContent = () => {
  const channelSettingsState = useChanneSettings();

  const { mutate: updateGuildChannel } = useUpdateGuildChannelMutation();
  const { mutate: deleteGuildChannel } = useDeleteGuildChannelMutation();
  const { mutate: assignRole } = useAssignGuildChannelToRoleMutation();
  const { mutate: syncParentRoles } = useSyncGuildChannelRolesWithParentMutation();
  const { mutate: unassignRole } = useUnassignGuildChannelFromRoleMutation();

  if (!channelSettingsState) {
    return <AccordError />;
  }

  const {
    channel: { id, guildId, topic, name, channelType, parentId, parentRoleSync },
    isPrivate,
    section,
    assignedRoles,
    defaultRole,
    unassignedRoles,
  } = channelSettingsState;

  const handleGuildChannelDelete = () => {
    actionConfirmationStore.setChannel({ id, name, channelType, guildId }, () => {
      channelSettingsStore.toggleOpen();
      deleteGuildChannel({ id, guildId });
    });
  };

  const handleGuildChannelUpdate = (updatedChannel: Pick<Channel, 'name' | 'topic'>) => {
    updateGuildChannel({
      id,
      channelType,
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
        channelType={channelType}
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
            channelType={channelType}
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
              channelType={channelType}
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
