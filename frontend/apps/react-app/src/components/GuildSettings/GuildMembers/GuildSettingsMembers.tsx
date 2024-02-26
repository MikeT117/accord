import { useState } from 'react';
import { useInfiniteGuildMembersQuery } from '@/api/guildMembers/getGuildMembers';
import { Input } from '@/shared-components/Input';
import { LoadingSpinner } from '@/shared-components/LoadingSpinner';
import { InfiniteLoad } from '@/shared-components/InfiniteLoad';
import { useCreateGuildBanMutation } from '../../../api/guildBans/createGuildBan';
import { useDeleteGuildMemberMutation } from '../../../api/guildMembers/deleteGuildMember';
import { Avatar } from '../../../shared-components/Avatar';
import { TimeAgo } from '../../../shared-components/TimeAgo';
import { getTimestampFromUUID } from '../../../utils/timestampFromUUID';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../../shared-components/Table';
import { GuildMemberRolesList } from '../../../shared-components/GuildMemberRolesList';
import { IconButton } from '../../../shared-components/IconButton';
import { DropdownMenu, DropdownMenuItem } from '../../../shared-components/DropdownMenu';
import { MagnifyingGlass, DotsThreeVertical } from '@phosphor-icons/react';
import { useI18nContext } from '../../../i18n/i18n-react';

export const GuildSettingsMembers = ({
    guildId,
    creatorId,
}: {
    guildId: string;
    creatorId: string;
}) => {
    const { LL } = useI18nContext();

    const [filter, setFilter] = useState('');

    const { data, isLoading, fetchNextPage, hasNextPage } = useInfiniteGuildMembersQuery(
        guildId,
        filter,
    );
    const { mutate: createBan } = useCreateGuildBanMutation();
    const { mutate: deleteMember } = useDeleteGuildMemberMutation();

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className='pl-8 pt-12'>
            <h1 className='mb-6 text-3xl font-semibold text-gray-12'>
                {LL.General.ServerMembers()}
            </h1>
            <Input
                className='mb-4'
                value={filter}
                onChange={(e) => setFilter(e.currentTarget.value)}
                placeholder={LL.Inputs.Placeholders.FilterMembers()}
                rightInputElement={<MagnifyingGlass size={20} className='text-gray-11' />}
            />
            <div className='flex rounded-md max-h-[85vh] overflow-auto'>
                <Table className='table-fixed'>
                    <TableHeader className='bg-gray-1'>
                        <TableRow>
                            <TableHead>{LL.Tables.Heads.Name()}</TableHead>
                            <TableHead>{LL.Tables.Heads.MemberSince()}</TableHead>
                            <TableHead>{LL.Tables.Heads.JoinedAccord()}</TableHead>
                            <TableHead>{LL.Tables.Heads.Roles()}</TableHead>
                            <TableHead>{LL.Tables.Heads.Actions()}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className='bg-gray-2'>
                        {data?.map((p) =>
                            p.map((m) => (
                                <TableRow key={m.user.id}>
                                    <TableCell>
                                        <div className='flex space-x-3'>
                                            <Avatar size='md' src={m.user.avatar} />
                                            <div className='flex flex-col space-y-1'>
                                                <span className='leading-none text-gray-12 text-sm font-bold'>
                                                    {m.user.displayName}
                                                </span>
                                                <span className='leading-none text-gray-11 font-medium text-xs'>
                                                    {m.user.username}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <TimeAgo date={m.joinedAt} />
                                    </TableCell>
                                    <TableCell>
                                        <TimeAgo date={getTimestampFromUUID(m.user.id)} />
                                    </TableCell>
                                    <TableCell>
                                        <GuildMemberRolesList guildId={guildId} roleIds={m.roles} />
                                    </TableCell>
                                    <TableCell>
                                        {m.user.id !== creatorId && m.user.id !== creatorId && (
                                            <DropdownMenu
                                                side='bottom'
                                                align='end'
                                                sideOffset={10}
                                                className='min-w-[180px]'
                                                tooltipText={LL.Tooltips.MemberActions()}
                                                tooltipPosition='top'
                                                triggerElem={
                                                    <IconButton padding='s' intent='secondary'>
                                                        <DotsThreeVertical
                                                            size={20}
                                                            weight='bold'
                                                        />
                                                    </IconButton>
                                                }
                                            >
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        createBan({
                                                            guildId,
                                                            reason: '',
                                                            userId: m.user.id,
                                                        })
                                                    }
                                                    fullWidth
                                                    intent='danger'
                                                >
                                                    <span className='whitespace-nowrap'>
                                                        {LL.Actions.BanMember({
                                                            displayName: m.user.displayName,
                                                        })}
                                                    </span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        deleteMember({ id: m.user.id, guildId })
                                                    }
                                                    fullWidth
                                                    intent='danger'
                                                >
                                                    <span className='whitespace-nowrap'>
                                                        {LL.Actions.KickMember({
                                                            displayName: m.user.displayName,
                                                        })}
                                                    </span>
                                                </DropdownMenuItem>
                                            </DropdownMenu>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )),
                        )}
                    </TableBody>
                </Table>
                <InfiniteLoad enabled={hasNextPage} onInView={fetchNextPage} />
            </div>
        </div>
    );
};
