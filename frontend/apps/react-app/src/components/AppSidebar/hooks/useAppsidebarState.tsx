import { useParams } from 'react-router-dom';
import { useGuildStore } from '@/shared-stores/guildStore';
import { useCurrentUserStore } from '../../../shared-stores/currentUserStore';

export const useAppsidebarState = () => {
    const { guildId = '' } = useParams();
    const guilds = useGuildStore((s) => s.ids.map((i) => s.guilds[i]!));
    const user = useCurrentUserStore((s) => s.user);

    if (!user) {
        return null;
    }

    return { activeGuildId: guildId, guilds, user };
};
