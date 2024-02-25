import { useLayoutEffect, useState } from 'react';
import { UnsavedSettingsPrompt } from '@/shared-components/Settings/UnsavedSettingsPrompt';
import { SettingToggle } from '@/shared-components/Settings';
import { GuildRoleListItem } from '@/components/GuildSettings/GuildRoles/GuildRoleEditor/GuildRoleListItem';
import { Input } from '@/shared-components/Input';
import { Button } from '@/shared-components/Button';
import { ListItem } from '@/shared-components/ListItem';
import { GuildChannel, GuildRole } from '../../types';
import { ArrowsClockwise } from '@phosphor-icons/react';
import { useFilteredRoles } from '../../shared-hooks/useFilteredRoles';
import { useI18nContext } from '../../i18n/i18n-react';

export const ChannelPermissions = ({
    assignedRoles,
    defaultRole,
    isPrivate,
    parentId,
    channelType,
    isSyncedWithParent,
    onAssignChannelRole,
    onSyncParentChannelRoles,
    onUnassignChannelRole,
}: Pick<GuildChannel, 'parentId' | 'channelType'> & {
    onAssignChannelRole: (roleId: string) => void;
    onUnassignChannelRole: (roleId: string) => void;
    onSyncParentChannelRoles: () => void;
    isPrivate: boolean;
    defaultRole: GuildRole;
    assignedRoles: GuildRole[];
    isSyncedWithParent: boolean;
}) => {
    const { LL } = useI18nContext();

    const [modifiedIsPrivate, setModifiedPrivate] = useState(isPrivate);
    const { filter, filteredRoles, setFilter } = useFilteredRoles(assignedRoles);

    const handleDiscardChanges = () => {
        setModifiedPrivate(isPrivate);
    };

    const handleSaveChanges = () => {
        if (modifiedIsPrivate === true) {
            onUnassignChannelRole(defaultRole.id);
        } else if (modifiedIsPrivate === false) {
            onAssignChannelRole(defaultRole.id);
        }
    };

    useLayoutEffect(handleDiscardChanges, [isPrivate]);

    return (
        <div className='w-full pl-8 pt-12'>
            <h1 className='mb-6 text-3xl font-semibold text-gray-12'>{LL.General.Permissions()}</h1>
            {parentId && isSyncedWithParent && (
                <span className='mb-3 block text-sm text-gray-11'>
                    {LL.Hints.PermissionsSynced()}
                </span>
            )}
            {parentId && !isSyncedWithParent && (
                <ListItem intent='secondary' className='mb-3' isHoverable={false}>
                    <ArrowsClockwise size={20} />
                    <span className='ml-3 mr-auto text-sm'>{LL.Hints.PermissionsUnsynced()}</span>
                    <Button padding='s' onClick={onSyncParentChannelRoles}>
                        {LL.Actions.Sync()}
                    </Button>
                </ListItem>
            )}
            <div className='mb-6 flex'>
                <SettingToggle
                    isChecked={modifiedIsPrivate ?? isPrivate}
                    label={
                        channelType !== 1
                            ? LL.Toggles.Labels.PrivateChannel()
                            : LL.Toggles.Labels.PrivateCategory()
                    }
                    helperText={
                        channelType !== 1
                            ? LL.Toggles.HelperText.RestrictChannel()
                            : LL.Toggles.HelperText.RestrictCategory()
                    }
                    onChange={() => setModifiedPrivate(!modifiedIsPrivate)}
                />
            </div>
            <div className='mb-6'>
                <Input
                    placeholder={LL.Inputs.Placeholders.FilterRoles()}
                    onChange={(e) => setFilter(e.currentTarget.value)}
                    value={filter}
                />
            </div>
            <div className='mb-6 flex flex-col space-y-2'>
                <span className='text-sm text-gray-11'>
                    {LL.General.AssignedRoles({ count: filteredRoles.length })}
                </span>
                <ul className='space-y-2'>
                    {filteredRoles.map((r) => (
                        <GuildRoleListItem
                            key={r.id}
                            name={r.name}
                            onDeleteRole={() => onUnassignChannelRole(r.id)}
                        />
                    ))}
                </ul>
            </div>
            <UnsavedSettingsPrompt
                isModified={modifiedIsPrivate !== isPrivate}
                isValid={true}
                onDiscard={handleDiscardChanges}
                onSave={handleSaveChanges}
            />
        </div>
    );
};
