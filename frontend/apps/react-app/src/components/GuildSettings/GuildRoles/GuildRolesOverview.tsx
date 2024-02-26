import { useState } from 'react';
import { Button } from '@/shared-components/Button';
import { Input } from '@/shared-components/Input';
import { actionConfirmationStore } from '../../ActionConfirmation';
import { GuildRoleListItem } from './GuildRoleEditor/GuildRoleListItem';
import { guildSettingsStore } from '../stores/useGuildSettingsStore';
import { useCreateRoleMutation } from '../../../api/guildRoles/createGuildRole';
import { useDeleteRoleMutation } from '../../../api/guildRoles/deleteGuildRole';
import { GuildRole } from '../../../types';
import { useFilterableEditableRoles } from '../hooks/useFilterableEditableRoles';
import { useDefaultRole } from '../hooks/useDefaultRole';
import { useI18nContext } from '../../../i18n/i18n-react';

export const GuildSettingsRolesOverview = ({
    guildId,
    roles,
}: {
    guildId: string;
    roles: GuildRole[];
}) => {
    const { LL } = useI18nContext();

    const [filter, setFilter] = useState('');
    const { mutate: createRole } = useCreateRoleMutation();
    const { mutate: deleteRole } = useDeleteRoleMutation();

    const customRoles = useFilterableEditableRoles(roles, filter);
    const defaultRole = useDefaultRole(roles);

    if (!defaultRole) {
        return null;
    }

    const handleRoleSelect = (guildRoleId: string) => {
        guildSettingsStore.setRole(guildRoleId);
    };

    const handleRoleFilterInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilter(e.currentTarget.value);
    };

    const handleRoleDelete = (id: string, name: string) => {
        actionConfirmationStore.deleteGuildRole({ guildId, id, name }, () =>
            deleteRole({ id, guildId }),
        );
    };

    const handleRoleCreate = () => {
        createRole(guildId);
    };

    return (
        <div className='pl-8 pt-12'>
            <h1 className='tex-gray-12 mb-6 text-3xl font-semibold text-gray-12'>
                {LL.General.Roles()}
            </h1>
            <ul className='mb-6'>
                <GuildRoleListItem
                    onClick={() => handleRoleSelect(defaultRole.id)}
                    onEditRole={() => handleRoleSelect(defaultRole.id)}
                    roleDescription={LL.Hints.DefaultRole()}
                    name={LL.General.DefaultPermissions()}
                />
            </ul>
            <div className='mb-6 flex items-center space-x-3'>
                <Input
                    placeholder={LL.Inputs.Placeholders.FilterRoles()}
                    onChange={handleRoleFilterInputChange}
                    value={filter}
                />
                <Button intent='primary' onClick={handleRoleCreate}>
                    {LL.Actions.CreateRole()}
                </Button>
            </div>
            <div className='mb-6 flex flex-col space-y-2'>
                <span className='text-sm text-gray-11'>{LL.General.CustomRoles()}</span>
                <ul className='space-y-2 overflow-y-scroll'>
                    {customRoles.map((r) => (
                        <GuildRoleListItem
                            key={r.id}
                            name={r.name}
                            onClick={() => handleRoleSelect(r.id)}
                            onDeleteRole={() => handleRoleDelete(r.id, r.name)}
                            onEditRole={() => handleRoleSelect(r.id)}
                        />
                    ))}
                </ul>
            </div>
        </div>
    );
};
