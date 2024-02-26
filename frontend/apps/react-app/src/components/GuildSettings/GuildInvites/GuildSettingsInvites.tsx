import { useDeleteGuildInviteMutation } from '@/api/guildInvites/deleteGuildInvite';
import { useInfiniteGuildInvitesQuery } from '@/api/guildInvites/getGuildInvites';
import { env } from '@/env';
import { InfiniteLoad } from '@/shared-components/InfiniteLoad';
import { useInviteLinkCopy } from '@/shared-hooks/useInviteLinkCopy';
import { IconButton } from '../../../shared-components/IconButton';
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from '../../../shared-components/Table';
import { TimeAgo } from '../../../shared-components/TimeAgo';
import { getTimestampFromUUID } from '../../../utils/timestampFromUUID';
import { Avatar } from '../../../shared-components/Avatar';
import { DropdownMenu, DropdownMenuItem } from '../../../shared-components/DropdownMenu';
import { DotsThreeVertical } from '@phosphor-icons/react';
import { useI18nContext } from '../../../i18n/i18n-react';

export const GuildSettingsInvites = ({ guildId }: { guildId: string }) => {
    const { LL } = useI18nContext();
    const { data, fetchNextPage, hasNextPage } = useInfiniteGuildInvitesQuery(guildId);
    const { mutate: deleteGuildInvite } = useDeleteGuildInviteMutation();
    const onCopy = useInviteLinkCopy();

    return (
        <div className='pl-8 pt-12'>
            <h1 className='mb-6 text-3xl font-semibold text-gray-12'>{LL.General.Invites()}</h1>
            <div className='flex rounded-md max-h-[85vh] overflow-auto'>
                <Table className='table-fixed'>
                    <TableHeader className='bg-gray-1'>
                        <TableRow>
                            <TableHead>{LL.Tables.Heads.Creator()}</TableHead>
                            <TableHead>{LL.Tables.Heads.Created()}</TableHead>
                            <TableHead>{LL.Tables.Heads.Uses()}</TableHead>
                            <TableHead>{LL.Tables.Heads.Actions()}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className='bg-gray-2'>
                        {data?.pages.map((p) =>
                            p.map((i) => (
                                <TableRow key={i.id}>
                                    <TableCell>
                                        <div className='flex space-x-3'>
                                            <Avatar size='md' src={i.creator.avatar} />
                                            <div className='flex flex-col space-y-1'>
                                                <span className='leading-none text-gray-12 text-sm font-bold'>
                                                    {i.creator.displayName}
                                                </span>
                                                <span className='leading-none text-gray-11 font-medium text-xs'>
                                                    {i.creator.username}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <TimeAgo date={getTimestampFromUUID(i.id)} />
                                    </TableCell>
                                    <TableCell>
                                        <span>{i.usedCount}</span>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu
                                            side='bottom'
                                            align='end'
                                            sideOffset={10}
                                            className='min-w-[180px]'
                                            tooltipText={LL.Tooltips.InviteActions()}
                                            tooltipPosition='top'
                                            triggerElem={
                                                <IconButton padding='s' intent='secondary'>
                                                    <DotsThreeVertical size={20} weight='bold' />
                                                </IconButton>
                                            }
                                        >
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    onCopy(
                                                        `https://${env.apiUrl}/v1/invites/${i.id}`,
                                                    )
                                                }
                                                fullWidth
                                            >
                                                <span className='whitespace-nowrap'>
                                                    {LL.Actions.CopyInvite()}
                                                </span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    deleteGuildInvite({ guildId, inviteId: i.id })
                                                }
                                                fullWidth
                                                intent='danger'
                                            >
                                                <span className='whitespace-nowrap'>
                                                    {LL.Actions.DeleteInvite()}
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
