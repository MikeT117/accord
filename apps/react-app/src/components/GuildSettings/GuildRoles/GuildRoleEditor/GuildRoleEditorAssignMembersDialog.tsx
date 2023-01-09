import { ReactNode, useCallback, useState } from 'react';
import type { GuildMember, GuildRole } from '@accord/common';
import { GuildMemberListItem } from '../../GuildMemberListItem';
import { LoadingSpinner } from '@/shared-components/LoadingSpinner';
import { Input } from '@/shared-components/Input';
import { guildSettingsActions, useGuildSettingsStore } from '../../stores/useGuildSettingsStore';
import { Dialog } from '@/shared-components/Dialog';
import { Button } from '@/shared-components/Button';
import { useGetRoleGuildMembersQuery } from '@/api/role/getRoleGuildMembers';
import { useAssignGuildMemberToRoleMutation } from '@/api/role/assignGuildMemberToRole';

export const GuildRoleEditorAssignMembersDialogContent = ({
  guildRole,
}: {
  guildRole: GuildRole;
}) => {
  const [selectedMembers, setSelectedMembers] = useState<Omit<GuildMember, 'roles'>[]>([]);
  const [memberFilter, setMemberFilter] = useState('');

  const { data, isLoading } = useGetRoleGuildMembersQuery({
    isAssigned: false,
    guildId: guildRole.guildId,
    roleId: guildRole.id,
  });

  const { mutate: assignRoleUser } = useAssignGuildMemberToRoleMutation();

  const filteredMembers = !memberFilter.trim()
    ? data?.pages
        .flat()
        .filter((m) => m.user.displayName.toLowerCase().includes(memberFilter.toLowerCase()))
    : data?.pages.flat();

  const handleMemberFilterInputChange = (val: string) => {
    setMemberFilter(val);
  };

  const assignUsers = async () => {
    assignRoleUser({
      guildId: guildRole.guildId,
      roleId: guildRole.id,
      members: selectedMembers,
    });
    guildSettingsActions.toggleAssignRoleMembersOpen();
  };

  const toggleSelectedUser = (guildMember: Omit<GuildMember, 'roles'>) => {
    if (selectedMembers.some((m) => m.id === guildMember.id)) {
      setSelectedMembers((s) => s.filter((m) => m.id !== guildMember.id));
    } else {
      setSelectedMembers((s) => [...s, guildMember]);
    }
  };

  return (
    <>
      <h1 className='p-4 py-5 text-xl font-semibold text-gray-12'>Assign Members</h1>
      <div className='grow px-4'>
        <Input
          id='member-filter'
          placeholder='Filter Members'
          onChange={(e) => handleMemberFilterInputChange(e.currentTarget.value)}
          value={memberFilter}
        />
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <ul className='mb-6 mt-3 min-h-[200px] space-y-2'>
            {filteredMembers?.map((m) => (
              <GuildMemberListItem
                key={m.id}
                user={m.user}
                onToggleSelect={() => toggleSelectedUser(m)}
                selected={selectedMembers.includes(m)}
              />
            ))}
          </ul>
        )}
      </div>
      <div className='flex justify-between bg-grayA-3 px-4 py-3'>
        <Button
          intent='link'
          padding='s'
          onClick={guildSettingsActions.toggleAssignRoleMembersOpen}
        >
          Cancel
        </Button>
        <Button onClick={assignUsers} disabled={selectedMembers.length === 0}>
          Assign
        </Button>
      </div>
    </>
  );
};

export const GuildRoleEditorAssignMembersDialog = ({ children }: { children: ReactNode }) => {
  const isOpen = useGuildSettingsStore(useCallback((s) => s.isAssignRoleMembersOpen, []));
  return (
    <Dialog isOpen={isOpen} onClose={guildSettingsActions.toggleAssignRoleMembersOpen}>
      {children}
    </Dialog>
  );
};
