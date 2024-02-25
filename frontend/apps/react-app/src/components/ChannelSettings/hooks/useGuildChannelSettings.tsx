import { useParams } from 'react-router-dom';
import { useChannelSettingsStore } from '../stores/useChannelSettingsStore';
import { useGuildStore } from '@/shared-stores/guildStore';
import { useDefaultRole } from '../../GuildSettings/hooks/useDefaultRole';

export const useGuildChanneSettings = () => {
    const { guildId = '' } = useParams();

    const section = useChannelSettingsStore((s) => s.section);
    const channelId = useChannelSettingsStore((s) => s.channelId);
    const channel = useGuildStore(
        (s) => s.guilds[guildId]?.channels.find((c) => c.id === channelId),
    );
    const parent = useGuildStore(
        (s) => s.guilds[guildId]?.channels.find((c) => c.id === channel?.parentId),
    );
    const roles = useGuildStore((s) => s.guilds[guildId]?.roles);
    const defaultRole = useDefaultRole(roles);

    if (!channel || !roles || !defaultRole) {
        return null;
    }

    const isPrivate = channel.roles.findIndex((cr) => cr === defaultRole.id) === -1;

    const assignedRoles = roles.filter(
        (r) =>
            !['@default', '@owner'].some((n) => n === r.name) &&
            channel.roles.some((cr) => cr === r.id),
    );

    const unassignedRoles = roles.filter(
        (r) =>
            !['@default', '@owner'].some((n) => n === r.name) &&
            !channel.roles.some((cr) => cr === r.id),
    );

    let parentRolesSynced = false;

    if (parent && channel.roles.length === parent.roles.length) {
        parentRolesSynced = channel.roles.every((cr) => parent.roles.some((pr) => pr === cr));
    }

    return {
        channel,
        isPrivate,
        assignedRoles,
        unassignedRoles,
        defaultRole,
        section,
        parentRolesSynced,
    };
};
