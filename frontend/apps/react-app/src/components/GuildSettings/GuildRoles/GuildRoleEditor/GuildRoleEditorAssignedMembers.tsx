import { useState } from 'react';
import { Button } from '@/shared-components/Button';
import { GuildMemberListItem } from '../../GuildMemberListItem';
import { Input } from '@/shared-components/Input';
import { LoadingSpinner } from '@/shared-components/LoadingSpinner';
import { guildSettingsStore } from '../../stores/useGuildSettingsStore';
import { useUnassignRoleFromUserMutation } from '../../../../api/userRoles/unassignRoleFromUser';
import { useInfiniteGuildRoleMembersQuery } from '../../../../api/guildRoles/getGuildRoleMembers';
import { GuildRole } from '../../../../types';
import { InfiniteLoad } from '../../../../shared-components/InfiniteLoad';
import { useI18nContext } from '../../../../i18n/i18n-react';

export const GuildRoleEditorAssignedMembers = ({
    role,
    isEditable = true,
}: {
    role: GuildRole;
    isEditable?: boolean;
}) => {
    const { LL } = useI18nContext();
    const [filter, setFilter] = useState('');
    const { mutate: unassignRole } = useUnassignRoleFromUserMutation();
    const { data, isLoading, hasNextPage, fetchNextPage } = useInfiniteGuildRoleMembersQuery(
        role.guildId,
        role.id,
        filter,
    );

    const handleMemberFilterInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilter(e.currentTarget.value);
    };

    const handleUnassignRole = (userId: string) => {
        unassignRole({ guildId: role.guildId, userId, roleId: role.id });
    };

    return (
        <>
            <div className='mb-6 flex items-center space-x-3'>
                <Input
                    id='member-filter'
                    placeholder={LL.Inputs.Placeholders.FilterMembers()}
                    onChange={handleMemberFilterInputChange}
                    value={filter}
                />
                <Button
                    onClick={guildSettingsStore.openRoleMemberAssignment}
                    disabled={!isEditable}
                    intent='primary'
                >
                    {LL.Actions.AddMember()}
                </Button>
            </div>
            <div className='mb-6 flex flex-col'>
                <span className='mb-1.5 text-sm text-gray-11'>{LL.General.Members()}</span>
                {isLoading && <LoadingSpinner />}
                <ul className='space-y-2'>
                    {data?.map((page) =>
                        page.map((member) => (
                            <GuildMemberListItem
                                key={member.user.id}
                                user={member.user}
                                onDeleteClick={() => handleUnassignRole(member.user.id)}
                                isEditable={isEditable}
                            />
                        )),
                    )}
                    <InfiniteLoad enabled={hasNextPage} onInView={fetchNextPage} />
                </ul>
            </div>
        </>
    );
};
