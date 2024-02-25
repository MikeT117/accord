import { FullscreenSettingsContentLayout } from '@/shared-components/FullscreenSettings';
import { IconButton } from '@/shared-components/IconButton';
import { actionConfirmationStore } from '@/components/ActionConfirmation';
import { ChannelOverview } from './ChannelOverview';
import { ChannelPermissions } from './ChannelPermissions';
import { ChannelPermissionsRolesSidebar } from './ChannelPermissionsRolesSidebar';
import { ChannelSettingsSidebar } from './ChannelSettingsSidebar';
import { useGuildChanneSettings } from './hooks/useGuildChannelSettings';
import { useUpdateGuildChannelMutation } from '@/api/channels/updateGuildChannel';
import { useDeleteGuildChannelMutation } from '@/api/channels/deleteGuildChannel';
import { AccordError } from '../../shared-components/AccordError';
import { useAssignRoleToGuildChannelMutation } from '../../api/channelRoles/assignRoleToGuildChannel';
import { useUnassignRoleFromGuildChannelMutation } from '../../api/channelRoles/unassignRoleFromGuildChannel';
import { useUpdateChannelMutation } from '../../api/channels/updateChannel';
import {
    channelSettingsStore,
    CHANNEL_OVERVIEW,
    CHANNEL_ROLES,
} from './stores/useChannelSettingsStore';
import { X } from '@phosphor-icons/react';

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
        parentRolesSynced,
    } = channelSettingsState;

    const handleGuildChannelDelete = () => {
        actionConfirmationStore.deleteChannel({ id, name, channelType: 1 }, () => {
            channelSettingsStore.close();
            deleteGuildChannel({ id, guildId });
        });
    };

    const handleChannelUpdate = (name: string, topic: string) => {
        updateChannel({ id, name, topic });
    };

    const handleAssignChannelRole = (roleId: string) => {
        assignRole({ channelId: id, guildId, roleId });
    };

    const handleUnassignChannelRole = (roleId: string) => {
        unassignRole({ guildId, channelId: id, roleId });
    };

    const handleSyncParentChannelRoles = () => {
        if (parentId) {
            updateGuildChannel({ guildId, channelId: id, parentId, lockPermissions: true });
        }
    };

    return (
        <>
            <ChannelSettingsSidebar
                name={name}
                channelType={channelType}
                section={section}
                onChannelDelete={handleGuildChannelDelete}
            />
            <FullscreenSettingsContentLayout>
                <IconButton
                    className='fixed right-[108px] top-12'
                    onClick={channelSettingsStore.close}
                    intent='secondary'
                >
                    <X size={20} />
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
                            roles={unassignedRoles}
                            onAssignChannelRole={handleAssignChannelRole}
                        />
                        <ChannelPermissions
                            parentId={parentId}
                            channelType={channelType}
                            isPrivate={isPrivate}
                            assignedRoles={assignedRoles}
                            defaultRole={defaultRole}
                            isSyncedWithParent={parentRolesSynced}
                            onAssignChannelRole={handleAssignChannelRole}
                            onSyncParentChannelRoles={handleSyncParentChannelRoles}
                            onUnassignChannelRole={handleUnassignChannelRole}
                        />
                    </div>
                )}
            </FullscreenSettingsContentLayout>
        </>
    );
};
