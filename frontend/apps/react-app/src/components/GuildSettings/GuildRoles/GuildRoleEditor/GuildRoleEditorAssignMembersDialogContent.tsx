import { ReactNode, useState } from 'react';
import { GuildMemberListItem } from '../../GuildMemberListItem';
import { LoadingSpinner } from '@/shared-components/LoadingSpinner';
import { Input } from '@/shared-components/Input';
import { guildSettingsStore, useGuildSettingsStore } from '../../stores/useGuildSettingsStore';
import { Dialog } from '@/shared-components/Dialog';
import { Button } from '@/shared-components/Button';
import { useInfiniteGuildRoleMembersQuery } from '../../../../api/guildRoles/getGuildRoleMembers';
import { useAssignRoleToUserMutation } from '../../../../api/userRoles/assignRoleToUser';
import { GuildRole } from '../../../../types';
import { InfiniteLoad } from '../../../../shared-components/InfiniteLoad';
import { useI18nContext } from '../../../../i18n/i18n-react';

export const GuildRoleEditorAssignMembersContent = ({ role }: { role: GuildRole }) => {
    const { LL } = useI18nContext();

    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [filter, setFilter] = useState('');

    const { data, isLoading, hasNextPage, fetchNextPage } = useInfiniteGuildRoleMembersQuery(
        role.guildId,
        role.id,
        filter,
        true,
    );
    const { mutate: assignRoleUser } = useAssignRoleToUserMutation();

    const handleMemberFilterInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilter(e.currentTarget.value);
    };

    const assignUsers = () => {
        assignRoleUser(
            {
                guildId: role.guildId,
                roleId: role.id,
                userIds: selectedUserIds,
            },
            {
                onSuccess() {
                    guildSettingsStore.closeRoleMemberAssignment();
                },
            },
        );
    };

    const toggleSelectedUser = (newId: string) => {
        if (selectedUserIds.some((id) => id === newId)) {
            setSelectedUserIds((ids) => ids.filter((id) => id !== newId));
        } else {
            setSelectedUserIds((ids) => [...ids, newId]);
        }
    };

    return (
        <div className='flex w-full flex-col bg-grayA-4'>
            <h1 className='p-4 py-5 text-xl font-semibold text-gray-12'>
                {LL.General.AssignMembers()}
            </h1>
            <div className='grow px-4'>
                <Input
                    id='member-filter'
                    placeholder={LL.Inputs.Placeholders.FilterMembers()}
                    onChange={handleMemberFilterInputChange}
                    value={filter}
                />
                {isLoading ? (
                    <LoadingSpinner />
                ) : (
                    <ul className='mb-6 mt-3 min-h-[200px] space-y-2'>
                        {data?.map((p) =>
                            p.map((m) => (
                                <GuildMemberListItem
                                    key={m.user.id}
                                    user={m.user}
                                    onToggleSelect={() => toggleSelectedUser(m.user.id)}
                                    selected={
                                        selectedUserIds.findIndex((ids) => ids === m.user.id) !== -1
                                    }
                                />
                            )),
                        )}
                        <InfiniteLoad enabled={hasNextPage} onInView={fetchNextPage} />
                    </ul>
                )}
            </div>
            <div className='flex justify-between bg-grayA-3 px-4 py-3'>
                <Button
                    intent='link'
                    padding='s'
                    onClick={guildSettingsStore.closeRoleMemberAssignment}
                >
                    {LL.Actions.Cancel()}
                </Button>
                <Button onClick={assignUsers} disabled={selectedUserIds.length === 0}>
                    {LL.Actions.Assign()}
                </Button>
            </div>
        </div>
    );
};
