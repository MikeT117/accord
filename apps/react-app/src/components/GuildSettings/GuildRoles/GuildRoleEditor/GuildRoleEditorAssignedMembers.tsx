import type { GuildRole } from '@accord/common';
import { useState } from 'react';
import { Button } from '@/shared-components/Button';
import { GuildMemberListItem } from '../../GuildMemberListItem';
import { Input } from '@/shared-components/Input';
import { LoadingSpinner } from '@/shared-components/LoadingSpinner';
import { guildSettingsStore } from '../../stores/useGuildSettingsStore';
import { useUnassignGuildMemberFromRoleMutation } from '@/api/role/unassignGuildMemberFromRole';
import { useGetRoleGuildMembersQuery } from '@/api/role/getRoleGuildMembers';

export const GuildRoleEditorAssignedMembers = ({
  role,
  isEditable,
}: {
  role: GuildRole;
  isEditable: boolean;
}) => {
  const [memberFilter, setMemberFilter] = useState('');
  const { mutate: unassignRole } = useUnassignGuildMemberFromRoleMutation();
  const { data, isLoading } = useGetRoleGuildMembersQuery({
    guildId: role.guildId,
    roleId: role.id,
    isAssigned: true,
  });

  const filteredMembers = !memberFilter.trim()
    ? data?.pages
        .flat()
        .filter((m) => m.user.displayName.toLowerCase().includes(memberFilter.toLowerCase()))
    : data?.pages.flat();
  const handleMemberFilterInputChange = (val: string) => {
    setMemberFilter(val);
  };

  const handleUnassignRole = (memberId: string) => {
    if (isEditable) {
      unassignRole({ guildId: role.guildId, memberId, roleId: role.id });
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
                key={member.id}
                user={member.user}
                onDeleteClick={() => handleUnassignRole(member.id)}
                isEditable={isEditable}
              />
            ))}
          </ul>
        )}
      </div>
    </>
  );
};
