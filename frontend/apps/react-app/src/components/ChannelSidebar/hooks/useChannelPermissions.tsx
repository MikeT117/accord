import { useParams } from 'react-router-dom';
import { useGuildStore } from '@/shared-stores/guildStore';

export const useChannelPermissions = (channelId: string) => {
    const { guildId = '' } = useParams();
    const guild = useGuildStore((s) => s.guilds[guildId]);

    if (!guild) {
        return 0;
    }

    const channel = guild.channels.find((c) => c.id === channelId);

    if (!channel) {
        return 0;
    }

    const matchedChannelRoles = guild.roles.filter((r) => channel.roles.some((cr) => cr === r.id));
    const matchedChannelUserRoles = matchedChannelRoles.filter((mcr) =>
        guild.member.roles.some((gmr) => gmr === mcr.id),
    );

    return matchedChannelUserRoles.reduce((a, b) => {
        return a | b.permissions;
    }, 0);
};
