import { useState } from 'react';
import { Input } from '@/shared-components/Input';
import { LoadingSpinner } from '@/shared-components/LoadingSpinner';
import { useDeleteGuildBanMutation } from '../../../api/guildBans/deleteGuildBan';
import { useInfiniteGuildBansQuery } from '../../../api/guildBans/getGuildBans';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../../shared-components/Table';
import { Avatar } from '../../../shared-components/Avatar';
import { TimeAgo } from '../../../shared-components/TimeAgo';
import { DropdownMenu, DropdownMenuItem } from '../../../shared-components/DropdownMenu';
import { getTimestampFromUUID } from '../../../utils/timestampFromUUID';
import { IconButton } from '../../../shared-components/IconButton';
import { InfiniteLoad } from '../../../shared-components/InfiniteLoad';
import { DotsThreeVertical, MagnifyingGlass } from '@phosphor-icons/react';
import { useI18nContext } from '../../../i18n/i18n-react';

export const GuildSettingsBans = ({ guildId }: { guildId: string }) => {
    const { LL } = useI18nContext();
    const [filter, setFilter] = useState('');

    const { data, isLoading, hasNextPage, fetchNextPage } = useInfiniteGuildBansQuery(
        guildId,
        filter,
    );
    const { mutate: unbanMember } = useDeleteGuildBanMutation();

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className='pl-8 pt-12'>
            <h1 className='mb-6 text-3xl font-semibold text-gray-12'>{LL.General.ServerBans()}</h1>
            <Input
                className='mb-4'
                value={filter}
                onChange={(e) => setFilter(e.currentTarget.value)}
                placeholder={LL.Inputs.Placeholders.FilterBans()}
                rightInputElement={<MagnifyingGlass size={20} className='text-gray-11' />}
            />

            <div className='flex rounded-md max-h-[85vh] overflow-auto'>
                <Table className='table-fixed'>
                    <TableHeader className='bg-gray-1'>
                        <TableRow>
                            <TableHead>{LL.Tables.Heads.User()}</TableHead>
                            <TableHead>{LL.Tables.Heads.Banned()}</TableHead>
                            <TableHead>{LL.Tables.Heads.Reason()}</TableHead>
                            <TableHead>{LL.Tables.Heads.Actions()}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className='bg-gray-2'>
                        {data?.map((p) =>
                            p.map((gb) => (
                                <TableRow key={gb.id}>
                                    <TableCell>
                                        <div className='flex space-x-3'>
                                            <Avatar size='md' src={gb.user.avatar} />
                                            <div className='flex flex-col space-y-1'>
                                                <span className='leading-none text-gray-12 text-sm font-bold'>
                                                    {gb.user.displayName}
                                                </span>
                                                <span className='leading-none text-gray-11 font-medium text-xs'>
                                                    {gb.user.username}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <TimeAgo date={getTimestampFromUUID(gb.id)} />
                                    </TableCell>
                                    <TableCell>
                                        <span>{gb.reason}</span>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu
                                            side='bottom'
                                            align='end'
                                            sideOffset={10}
                                            className='min-w-[180px]'
                                            tooltipText={LL.Tooltips.BanActions()}
                                            tooltipPosition='top'
                                            triggerElem={
                                                <IconButton padding='s' intent='secondary'>
                                                    <DotsThreeVertical size={20} weight='bold' />
                                                </IconButton>
                                            }
                                        >
                                            <DropdownMenuItem
                                                intent='warning'
                                                onClick={() => unbanMember({ guildId, id: gb.id })}
                                                fullWidth
                                            >
                                                <span className='whitespace-nowrap'>
                                                    {LL.Actions.Unban()}
                                                </span>
                                            </DropdownMenuItem>
                                        </DropdownMenu>
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
