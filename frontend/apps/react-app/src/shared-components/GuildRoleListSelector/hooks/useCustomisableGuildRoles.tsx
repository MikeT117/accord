import { useParams } from 'react-router-dom';
import { useGuildStore } from '@/shared-stores/guildStore';

export const useCustomisableGuildRoles = (id?: string) => {
    const { guildId = '' } = useParams();
    const roles = useGuildStore(
        (s) =>
            s.guilds[id ?? guildId]?.roles.filter((r) => !['@default', '@owner'].includes(r.name)),
    );

    return roles ?? [];
};
