import { useLayoutEffect, useState } from 'react';
import type { GuildRole, RolePermission } from '@accord/common';
import { ROLE_INFO } from '@/constants';
import { UnsavedSettingsPrompt } from '@/shared-components/Settings/UnsavedSettingsPrompt';
import { SettingToggle } from '@/shared-components/Settings';
import { useUpdateRoleMutation } from '@/api/role/updateGuildRole';

export const GuildRoleEditorPermissions = ({ role }: { role: GuildRole }) => {
  const [updatedRole, set] = useState(role);

  useLayoutEffect(() => {
    set(role);
  }, [role]);

  const { mutate: updateRole } = useUpdateRoleMutation();
  const isModified = JSON.stringify(role) !== JSON.stringify(updatedRole);

  const saveChanges = () => {
    updateRole({ ...role, ...updatedRole });
  };

  const resetModifiedRole = () => {
    set(role);
  };

  return (
    <ul className='space-y-2'>
      {(Object.keys(role) as RolePermission[]).map(
        (key) =>
          !['id', 'name', 'guildId'].some((k) => k === key) && (
            <SettingToggle
              key={key}
              isChecked={updatedRole[key]}
              onChange={() => set((s) => ({ ...s, [key]: !updatedRole[key] }))}
              label={ROLE_INFO[key].friendlyName}
              helperText={ROLE_INFO[key].description}
            />
          ),
      )}
      <UnsavedSettingsPrompt
        isVisible={isModified}
        onDiscard={resetModifiedRole}
        onSave={saveChanges}
      />
    </ul>
  );
};
