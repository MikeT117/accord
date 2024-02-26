import { useState } from 'react';
import { UnsavedSettingsPrompt } from '@/shared-components/Settings/UnsavedSettingsPrompt';
import { Input } from '@/shared-components/Input';
import { useUpdateRoleMutation } from '@/api/guildRoles/updateGuildRole';
import { GuildRole } from '../../../../types';
import { z } from 'zod';
import { useI18nContext } from '../../../../i18n/i18n-react';

const roleNameSchema = z
    .string()
    .min(3)
    .max(100)
    .refine((s) => !s.includes(' '));

export const GuildRoleEditorDisplay = ({
    role,
    isEditable = true,
}: {
    role: GuildRole;
    isEditable?: boolean;
}) => {
    const { LL } = useI18nContext();

    const [modifiedName, setModifiedName] = useState(role.name);
    const { mutate: updateRole } = useUpdateRoleMutation();

    const { success: isModifiedNameValid } = roleNameSchema.safeParse(modifiedName);

    const saveChanges = () => {
        updateRole({ ...role, name: modifiedName });
    };

    const discardChanges = () => {
        setModifiedName(role.name);
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setModifiedName(e.currentTarget.value);
    };

    return (
        <ul className='space-y-2'>
            <label className='flex w-full flex-col' htmlFor='role-name'>
                <span className='mb-2 text-sm font-semibold text-gray-11'>
                    {LL.General.RoleName()}
                </span>
                <Input
                    id='role-name'
                    placeholder={role.name}
                    value={modifiedName}
                    isError={modifiedName !== role.name && !isModifiedNameValid}
                    onChange={handleNameChange}
                    disabled={!isEditable}
                />
            </label>
            <UnsavedSettingsPrompt
                isModified={modifiedName !== role.name}
                isValid={isModifiedNameValid}
                onDiscard={discardChanges}
                onSave={saveChanges}
            />
        </ul>
    );
};
