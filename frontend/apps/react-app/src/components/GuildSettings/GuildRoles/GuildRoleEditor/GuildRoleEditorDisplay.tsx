import { useLayoutEffect, useState } from 'react';
import { UnsavedSettingsPrompt } from '@/shared-components/Settings/UnsavedSettingsPrompt';
import { Input } from '@/shared-components/Input';
import { useUpdateRoleMutation } from '@/api/guildRoles/updateGuildRole';
import { GuildRole } from '../../../../types';

export const GuildRoleEditorDisplay = ({
  role,
  isEditable,
}: {
  role: GuildRole;
  isEditable: boolean;
}) => {
  const [roleName, set] = useState(role.name);
  const { mutate: updateRole } = useUpdateRoleMutation();

  useLayoutEffect(() => {
    set(role.name);
  }, [role]);

  const isValid = /[a-zA-Z-]+/g.test(roleName);
  const changesCanBeApplied = isValid && roleName !== role.name;
  const saveChanges = () => {
    updateRole({ ...role, name: roleName });
  };

  return (
    <ul className='space-y-2'>
      <label className='flex w-full flex-col' htmlFor='role-name'>
        <span className='mb-2 text-sm font-semibold text-gray-11'>Role Name</span>
        <Input
          id='role-name'
          placeholder={roleName}
          value={roleName}
          onChange={(e) => set(e.currentTarget.value)}
          disabled={!isEditable}
        />
      </label>
      <UnsavedSettingsPrompt
        isVisible={changesCanBeApplied}
        onDiscard={() => set(role.name)}
        onSave={saveChanges}
      />
    </ul>
  );
};
