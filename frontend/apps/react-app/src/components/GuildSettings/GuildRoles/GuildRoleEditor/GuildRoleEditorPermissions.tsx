import { useLayoutEffect, useState } from 'react';
import { MAX_ROLE_PERMS } from '@/constants';
import { UnsavedSettingsPrompt } from '@/shared-components/Settings/UnsavedSettingsPrompt';
import { SettingToggle } from '@/shared-components/Settings';
import { useUpdateRoleMutation } from '@/api/guildRoles/updateGuildRole';
import { GuildRole } from '../../../../types';
import { z } from 'zod';
import { useI18nContext } from '../../../../i18n/i18n-react';

const rolePermissionsSchema = z.number().min(0).max(MAX_ROLE_PERMS);

export const GuildRoleEditorPermissions = ({
    id,
    name,
    guildId,
    permissions,
    isEditable = true,
}: Pick<GuildRole, 'id' | 'guildId' | 'name' | 'permissions'> & {
    isEditable?: boolean;
}) => {
    const { LL } = useI18nContext();

    const [modifiedPermissions, setModifiedPermissions] = useState(permissions);
    const { mutate: updateRole } = useUpdateRoleMutation();

    const isPermissionsModified = modifiedPermissions !== permissions;

    const saveChanges = () => {
        updateRole({ guildId, id, name, permissions: modifiedPermissions });
    };

    const resetModifiedRole = () => {
        setModifiedPermissions(permissions);
    };

    const handlePermissionToggle = (offset: number) => {
        const { success } = rolePermissionsSchema.safeParse(modifiedPermissions ^ (1 << offset));
        if (!success) {
            return;
        }
        setModifiedPermissions((s) => s ^ (1 << offset));
    };

    useLayoutEffect(resetModifiedRole, [permissions]);

    const RoleInfo = [
        {
            offset: 0,
            label: LL.Permissions.Titles.ViewChannel(),
            description: LL.Permissions.Descriptions.ViewChannel(),
        },
        {
            offset: 1,
            label: LL.Permissions.Titles.ManageChannels(),
            description: LL.Permissions.Descriptions.ManageChannels(),
        },
        {
            offset: 2,
            label: LL.Permissions.Titles.SendMessages(),
            description: LL.Permissions.Descriptions.SendMessages(),
        },
        {
            offset: 3,
            label: LL.Permissions.Titles.ManageMessages(),
            description: LL.Permissions.Descriptions.ManageMessages(),
        },
        {
            offset: 4,
            label: LL.Permissions.Titles.ManageGuild(),
            description: LL.Permissions.Descriptions.ManageGuild(),
        },
        {
            offset: 5,
            label: LL.Permissions.Titles.GuildAdmin(),
            description: LL.Permissions.Descriptions.GuildAdmin(),
        },
    ];

    return (
        <ul className='space-y-2'>
            {RoleInfo.map((ri) => (
                <SettingToggle
                    key={ri.offset}
                    isChecked={(modifiedPermissions & (1 << ri.offset)) !== 0}
                    onChange={() => handlePermissionToggle(ri.offset)}
                    label={ri.label}
                    helperText={ri.description}
                    isDisabled={!isEditable}
                />
            ))}
            <UnsavedSettingsPrompt
                isModified={isPermissionsModified}
                isValid={true}
                onDiscard={resetModifiedRole}
                onSave={saveChanges}
            />
        </ul>
    );
};
