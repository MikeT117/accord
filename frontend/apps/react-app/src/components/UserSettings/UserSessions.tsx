import { IconButton } from '@/shared-components/IconButton';
import { TimeAgo } from '@/shared-components/TimeAgo';
import { InfiniteLoad } from '../../shared-components/InfiniteLoad';
import { useDeleteUserSessionMutation } from '../../api/users/deleteUserSession';
import { useInfiniteUserSessionsQuery } from '../../api/users/getUserSessions';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../shared-components/Table';
import { Trash } from '@phosphor-icons/react';
import { getTimestampFromUUID } from '../../utils/timestampFromUUID';
import { useI18nContext } from '../../i18n/i18n-react';

export const UserSessions = () => {
    const { LL } = useI18nContext();

    const { data, fetchNextPage, hasNextPage } = useInfiniteUserSessionsQuery();
    const { mutate: deleteSession } = useDeleteUserSessionMutation();

    return (
        <div className='flex flex-col space-y-6 pl-8 pt-12'>
            <h1 className='text-3xl font-semibold text-gray-12'>{LL.General.SessionsManager()}</h1>

            <div className='flex rounded-md max-h-[85vh] overflow-auto'>
                <Table>
                    <TableHeader className='bg-gray-1'>
                        <TableRow>
                            <TableHead>{LL.Tables.Heads.ID()}</TableHead>
                            <TableHead>{LL.Tables.Heads.Created()}</TableHead>
                            <TableHead>{LL.Tables.Heads.Expires()}</TableHead>
                            <TableHead>{LL.Tables.Heads.CurrentSession()}</TableHead>
                            <TableHead>{LL.Tables.Heads.Actions()}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className='bg-gray-2'>
                        {data?.pages.map((p) =>
                            p.map((s) => (
                                <TableRow key={s.id}>
                                    <TableCell>
                                        <span>{s.id}</span>
                                    </TableCell>
                                    <TableCell>
                                        <TimeAgo date={getTimestampFromUUID(s.id)} />
                                    </TableCell>
                                    <TableCell>
                                        <TimeAgo date={s.expiresAt} />
                                    </TableCell>
                                    <TableCell>
                                        <span>{s.isCurrentSession ? 'Yes' : 'No'}</span>
                                    </TableCell>
                                    <TableCell>
                                        {!s.isCurrentSession && (
                                            <IconButton
                                                padding='s'
                                                intent='danger'
                                                tooltipText={LL.Tooltips.DeleteSession()}
                                                onClick={() => deleteSession(s.id)}
                                            >
                                                <Trash size={16} />
                                            </IconButton>
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
