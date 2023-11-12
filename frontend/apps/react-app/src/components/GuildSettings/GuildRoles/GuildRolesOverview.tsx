import { useState } from 'react';
import { Button } from '@/shared-components/Button';
import { Input } from '@/shared-components/Input';
import { actionConfirmationStore } from '../../ActionConfirmation';
import { GuildRoleListItem } from './GuildRoleEditor/GuildRoleListItem';
import { guildSettingsStore } from '../stores/useGuildSettingsStore';
import { useCreateRoleMutation } from '../../../api/guildRoles/createGuildRole';
import { useDeleteRoleMutation } from '../../../api/guildRoles/deleteGuildRole';
import { GuildRole } from '../../../types';

const { setRole } = guildSettingsStore;

export const GuildSettingsRolesOverview = ({
  guildId,
  customRoles,
  defaultRole,
}: {
  guildId: string;
  customRoles: GuildRole[];
  defaultRole: GuildRole;
}) => {
  const [roleFilter, setRoleFilter] = useState('');
  const { mutate: createRole } = useCreateRoleMutation();
  const { mutate: deleteRole } = useDeleteRoleMutation();

  const filteredRoles =
    customRoles && !!roleFilter
      ? customRoles.filter((r) => r.name.toLowerCase().includes(roleFilter.toLowerCase()))
      : customRoles;

  const handleRoleSelect = (guildRoleId: string) => {
    setRole(guildRoleId);
  };

  const handleRoleFilterInputChange = (val: string) => {
    if (!val.includes(' ')) {
      setRoleFilter(val);
    }
  };

  const handleRoleDelete = ({ id, name }: GuildRole) => {
    actionConfirmationStore.setGuildRole({ guildId, id, name }, () =>
      deleteRole({ roleId: id, guildId }),
    );
  };

  const handleRoleCreate = () => {
    createRole(guildId);
  };

  return (
    <div className='pl-8 pt-12'>
      <h1 className='tex-gray-12 mb-6 text-3xl font-semibold text-gray-12'>Roles</h1>
      <ul className='mb-6'>
        <GuildRoleListItem
          onClick={() => handleRoleSelect(defaultRole.id)}
          onEditRole={() => handleRoleSelect(defaultRole.id)}
          roleDescription='Applies to all members of this server'
          name='Default Permissions'
        />
      </ul>
      <div className='mb-6 flex items-center space-x-3'>
        <Input
          placeholder='Filter Roles'
          onChange={(e) => handleRoleFilterInputChange(e.currentTarget.value)}
          value={roleFilter}
        />
        <Button intent='primary' onClick={handleRoleCreate}>
          Create Role
        </Button>
      </div>
      <div className='mb-6 flex flex-col space-y-2'>
        <span className='text-sm text-gray-11'>Custom roles - {customRoles.length}</span>
        {filteredRoles && (
          <ul className='space-y-2 overflow-y-scroll'>
            {filteredRoles.map((r) => (
              <GuildRoleListItem
                key={r.id}
                name={r.name}
                onClick={() => handleRoleSelect(r.id)}
                onDeleteRole={() => handleRoleDelete(r)}
                onEditRole={() => handleRoleSelect(r.id)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
