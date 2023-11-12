import { useState } from 'react';
import { ROLE_INFO } from '@/constants';
import { UnsavedSettingsPrompt } from '@/shared-components/Settings/UnsavedSettingsPrompt';
import { SettingToggle } from '@/shared-components/Settings';
import { useUpdateRoleMutation } from '@/api/guildRoles/updateGuildRole';
import { GuildRole } from '../../../../types';

export const GuildRoleEditorPermissions = ({ role }: { role: GuildRole }) => {
  const [modifiedPermissions, set] = useState(role.permissions);
  const { mutate: updateRole } = useUpdateRoleMutation();

  const saveChanges = () => {
    updateRole({
      guildId: role.guildId,
      id: role.id,
      name: role.name,
      permissions: modifiedPermissions,
    });
  };

  const resetModifiedRole = () => {
    set(role.permissions);
  };

  const handlePermissionToggle = (offset: number) => {
    set((s) => s ^ (1 << offset));
  };

  return (
    <ul className='space-y-2'>
      {ROLE_INFO.map((ri) => (
        <SettingToggle
          key={ri.offset}
          isChecked={(modifiedPermissions & (1 << ri.offset)) !== 0}
          onChange={() => handlePermissionToggle(ri.offset)}
          label={ri.friendlyName}
          helperText={ri.description}
        />
      ))}
      <UnsavedSettingsPrompt
        isVisible={role.permissions !== modifiedPermissions}
        onDiscard={resetModifiedRole}
        onSave={saveChanges}
      />
    </ul>
  );
};
