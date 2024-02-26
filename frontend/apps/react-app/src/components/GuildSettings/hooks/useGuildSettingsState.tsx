import { useParams } from 'react-router-dom';
import { useGuildStore } from '../../../shared-stores/guildStore';
import { useGuildSettingsStore } from '../stores/useGuildSettingsStore';

export const useGuildSettingsState = () => {
    const { guildId = '' } = useParams();

    const name = useGuildStore((s) => s.guilds[guildId]?.name);
    const isDiscoverable = useGuildStore((s) => s.guilds[guildId]!.isDiscoverable);
    const creatorId = useGuildStore((s) => s.guilds[guildId]?.creatorId);
    const guildCategoryId = useGuildStore((s) => s.guilds[guildId]?.guildCategoryId);
    const banner = useGuildStore((s) => s.guilds[guildId]?.banner);
    const description = useGuildStore((s) => s.guilds[guildId]?.description);
    const icon = useGuildStore((s) => s.guilds[guildId]?.icon);
    const roles = useGuildStore((s) => s.guilds[guildId]?.roles);

    const section = useGuildSettingsStore((s) => s.section);

    if (
        typeof name === 'undefined' ||
        typeof isDiscoverable === 'undefined' ||
        typeof creatorId === 'undefined' ||
        typeof guildCategoryId === 'undefined' ||
        typeof banner === 'undefined' ||
        typeof description === 'undefined' ||
        typeof icon === 'undefined' ||
        typeof roles === 'undefined'
    ) {
        return null;
    }

    return {
        id: guildId,
        name,
        creatorId,
        isDiscoverable,
        guildCategoryId,
        banner,
        description,
        icon,
        roles,
        section,
    };
};
