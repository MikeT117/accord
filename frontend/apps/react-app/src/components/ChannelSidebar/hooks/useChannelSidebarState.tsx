import { useParams } from 'react-router-dom';
import { useGuildStore } from '@/shared-stores/guildStore';
import { useMemo } from 'react';
import { sortChannels } from '../utils/sortChannels';

export const useChannelSidebarState = () => {
    const { guildId = '', channelId = '' } = useParams();
    const guildName = useGuildStore((s) => s.guilds[guildId]?.name);
    const guildCreatorId = useGuildStore((s) => s.guilds[guildId]?.creatorId);
    const guildRoles = useGuildStore((s) => s.guilds[guildId]?.roles);
    const guildMemberRoles = useGuildStore((s) => s.guilds[guildId]?.member.roles);
    const channels = useGuildStore((s) => s.guilds[guildId]?.channels);

    if (
        typeof guildName === 'undefined' ||
        typeof guildCreatorId === 'undefined' ||
        typeof guildRoles === 'undefined' ||
        typeof guildMemberRoles === 'undefined' ||
        typeof channels === 'undefined'
    ) {
        return null;
    }

    const { parents, children, orphans } = useMemo(
        () => sortChannels(channels, guildMemberRoles, guildRoles),
        [channels, guildMemberRoles, guildRoles],
    );

    return {
        guildId,
        channelId,
        guildName,
        guildCreatorId,
        children,
        orphans,
        parents,
    };
};
