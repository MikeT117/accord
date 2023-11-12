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
import { useGuildChanneSettings } from './hooks/useGuildChannelSettings';
import { useUpdateGuildChannelMutation } from '@/api/channels/updateGuildChannel';
import { useDeleteGuildChannelMutation } from '@/api/channels/deleteGuildChannel';

import { AccordError } from '../../shared-components/AccordError';
import { useAssignRoleToGuildChannelMutation } from '../../api/channelRoles/assignRoleToGuildChannel';
import { useUnassignRoleFromGuildChannelMutation } from '../../api/channelRoles/unassignRoleFromGuildChannel';
import { useUpdateChannelMutation } from '../../api/channels/updateChannel';

export const ChannelSettingsContent = () => {
  const channelSettingsState = useGuildChanneSettings();

  const { mutate: deleteGuildChannel } = useDeleteGuildChannelMutation();
  const { mutate: assignRole } = useAssignRoleToGuildChannelMutation();
  const { mutate: updateGuildChannel } = useUpdateGuildChannelMutation();
  const { mutate: updateChannel } = useUpdateChannelMutation();
  const { mutate: unassignRole } = useUnassignRoleFromGuildChannelMutation();

  if (!channelSettingsState) {
    return <AccordError />;
  }

  const {
    channel: { id, guildId, topic, name, channelType, parentId },
    isPrivate,
    section,
    assignedRoles,
    defaultRole,
    unassignedRoles,
  } = channelSettingsState;

  const handleGuildChannelDelete = () => {
    actionConfirmationStore.setChannel({ id, name, channelType: 1 }, () => {
      channelSettingsStore.toggleOpen();
      deleteGuildChannel({ id, guildId });
    });
  };

  const handleChannelUpdate = (name: string, topic: string) => {
    updateChannel({ id, name, topic });
  };

  const handleGuildChannelRoleAssign = (roleId: string) => {
    assignRole({ channelId: id, guildId, roleId });
  };

  const handleGuildChannelRoleUnassign = (roleId: string) => {
    unassignRole({ guildId, channelId: id, roleId });
  };

  const handleGuildChannelParentRoleSync = () => {
    if (parentId) {
      updateGuildChannel({ guildId, channelId: id, parentId, sync: true });
    }
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
            onChannelUpdate={handleChannelUpdate}
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
