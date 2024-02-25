import { useNavigate } from 'react-router-dom';
import { Input } from '@/shared-components/Input';
import { currentUserSettingsStore } from './stores/useCurrentUserSettingsStore';
import { useState, useMemo } from 'react';
import { useGuildStore } from '../../shared-stores/guildStore';
import { GuildMemberRolesList } from '../../shared-components/GuildMemberRolesList';
import { IconButton } from '../../shared-components/IconButton';
import { TimeAgo } from '../../shared-components/TimeAgo';
import { Avatar } from '../../shared-components/Avatar';
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from '../../shared-components/Table';
import { ArrowSquareOut } from '@phosphor-icons/react';
import { useI18nContext } from '../../i18n/i18n-react';

export const UserGuilds = () => {
    const { LL } = useI18nContext();

    const [filter, setFilter] = useState('');
    const guilds = useGuildStore((s) => s.ids.map((i) => s.guilds[i]!));

    const navigate = useNavigate();

    const filteredGuilds = useMemo(() => {
        if (filter.trim().length === 0) {
            return guilds;
        }

        return guilds.filter((g) =>
            g.name.toLocaleLowerCase().includes(filter.toLocaleLowerCase()),
        );
    }, [filter, guilds]);

    const handleGuildClick = (id: string) => {
        navigate(`/app/server/${id}`);
        currentUserSettingsStore.close();
    };

    return (
        <div className='flex flex-col space-y-6 pl-8 pt-12'>
            <h1 className='text-3xl font-semibold text-gray-12'>{LL.General.ServersManager()}</h1>
            <div className='flex items-center'>
                <Input
                    id='guild-manager-filter'
                    placeholder={LL.Inputs.Placeholders.FilterServers()}
                    onChange={(e) => setFilter(e.currentTarget.value)}
                    value={filter}
                />
            </div>
            <div className='flex rounded-md max-h-[85vh] overflow-auto'>
                <Table className='table-fixed'>
                    <TableHeader className='bg-gray-1'>
                        <TableRow>
                            <TableHead>{LL.Tables.Heads.Name()}</TableHead>
                            <TableHead>{LL.Tables.Heads.MemberSince()}</TableHead>
                            <TableHead>{LL.Tables.Heads.IsCreator()}</TableHead>
                            <TableHead>{LL.Tables.Heads.Roles()}</TableHead>
                            <TableHead>{LL.Tables.Heads.Actions()}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className='bg-gray-2'>
                        {filteredGuilds.map((g) => (
                            <TableRow key={g.id}>
                                <TableCell className='flex space-x-3'>
                                    <Avatar size='md' src={g.icon} />
                                    <span className='leading-none text-gray-12 text-sm font-bold'>
                                        {g.name}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <TimeAgo date={g.member.joinedAt} />
                                </TableCell>
                                <TableCell>
                                    <span className='leading-none text-gray-12 text-sm'>
                                        {g.creatorId === g.member.user.id
                                            ? LL.General.Yes()
                                            : LL.General.No()}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <GuildMemberRolesList guildId={g.id} roleIds={g.member.roles} />
                                </TableCell>
                                <TableCell className='flex space-x-1'>
                                    <IconButton
                                        padding='s'
                                        intent='secondary'
                                        onClick={() => handleGuildClick(g.id)}
                                        tooltipText={LL.Tooltips.NavigateToGuild({
                                            guildName: g.name,
                                        })}
                                    >
                                        <ArrowSquareOut size={20} />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};
