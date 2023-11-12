import { useState } from 'react';
import { Button } from '@/shared-components/Button';
import { GuildMemberListItem } from '../../GuildMemberListItem';
import { Input } from '@/shared-components/Input';
import { LoadingSpinner } from '@/shared-components/LoadingSpinner';
import { guildSettingsStore } from '../../stores/useGuildSettingsStore';
import { useUnassignRoleFromUserMutation } from '../../../../api/userRoles/unassignRoleFromUser';
import { useGetGuildRoleMembersQuery } from '../../../../api/guildRoles/getGuildRoleMembers';
import { GuildRole } from '../../../../types';

export const GuildRoleEditorAssignedMembers = ({
  role,
  isEditable,
}: {
  role: GuildRole;
  isEditable: boolean;
}) => {
  const [memberFilter, setMemberFilter] = useState('');
  const { mutate: unassignRole } = useUnassignRoleFromUserMutation();
  const { data, isLoading } = useGetGuildRoleMembersQuery(role.guildId, role.id);

  const filteredMembers = !memberFilter.trim()
    ? data?.pages
        .flat()
        .filter((m) => m.user.displayName.toLowerCase().includes(memberFilter.toLowerCase()))
    : data?.pages.flat();
  const handleMemberFilterInputChange = (val: string) => {
    setMemberFilter(val);
  };

  const handleUnassignRole = (userId: string) => {
    if (isEditable) {
      unassignRole({ guildId: role.guildId, userId, roleId: role.id });
    }
  };

  return (
    <>
      <div className='mb-6 flex items-center space-x-3'>
        <Input
          id='member-filter'
          placeholder='Filter Members'
          onChange={(e) => handleMemberFilterInputChange(e.currentTarget.value)}
          value={memberFilter}
        />
        <Button
          onClick={guildSettingsStore.toggleAssignRoleMembersOpen}
          disabled={!isEditable}
          intent='primary'
        >
          Add Member
        </Button>
      </div>
      <div className='mb-6 flex flex-col'>
        <span className='mb-1.5 text-sm text-gray-11'>Members</span>
        {isLoading && <LoadingSpinner />}
        {filteredMembers && (
          <ul className='space-y-2'>
            {filteredMembers.map((member) => (
              <GuildMemberListItem
                key={member.user.id}
                user={member.user}
                onDeleteClick={() => handleUnassignRole(member.user.id)}
                isEditable={isEditable}
              />
            ))}
          </ul>
        )}
      </div>
    </>
  );
};
