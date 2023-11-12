import { ReactNode, useCallback, useState } from 'react';
import { GuildMemberListItem } from '../../GuildMemberListItem';
import { LoadingSpinner } from '@/shared-components/LoadingSpinner';
import { Input } from '@/shared-components/Input';
import { guildSettingsStore, useGuildSettingsStore } from '../../stores/useGuildSettingsStore';
import { Dialog } from '@/shared-components/Dialog';
import { Button } from '@/shared-components/Button';
import { useGetGuildRoleMembersQuery } from '../../../../api/guildRoles/getGuildRoleMembers';
import { useAssignRoleToUserMutation } from '../../../../api/userRoles/assignRoleToUser';
import { GuildRole } from '../../../../types';

export const GuildRoleEditorAssignMembersDialogContent = ({
  guildRole,
}: {
  guildRole: GuildRole;
}) => {
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [memberFilter, setMemberFilter] = useState('');

  const { data, isLoading } = useGetGuildRoleMembersQuery(guildRole.guildId, guildRole.id, true);
  const { mutate: assignRoleUser } = useAssignRoleToUserMutation();

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
      userIds: selectedUserIds,
    });
    guildSettingsStore.toggleAssignRoleMembersOpen();
  };

  const toggleSelectedUser = (newId: string) => {
    if (selectedUserIds.some((id) => id === newId)) {
      setSelectedUserIds((ids) => ids.filter((id) => id !== newId));
    } else {
      setSelectedUserIds((ids) => [...ids, newId]);
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
                key={m.user.id}
                user={m.user}
                onToggleSelect={() => toggleSelectedUser(m.user.id)}
                selected={selectedUserIds.findIndex((ids) => ids === m.user.id) !== -1}
              />
            ))}
          </ul>
        )}
      </div>
      <div className='flex justify-between bg-grayA-3 px-4 py-3'>
        <Button intent='link' padding='s' onClick={guildSettingsStore.toggleAssignRoleMembersOpen}>
          Cancel
        </Button>
        <Button onClick={assignUsers} disabled={selectedUserIds.length === 0}>
          Assign
        </Button>
      </div>
    </>
  );
};

export const GuildRoleEditorAssignMembersDialog = ({ children }: { children: ReactNode }) => {
  const isOpen = useGuildSettingsStore(useCallback((s) => s.isAssignRoleMembersOpen, []));
  return (
    <Dialog isOpen={isOpen} onClose={guildSettingsStore.toggleAssignRoleMembersOpen}>
      {children}
    </Dialog>
  );
};
