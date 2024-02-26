import { useGuildStore } from '@/shared-stores/guildStore';

export const useGuildMemberRoles = (guildId: string, memberRoles: string[]) =>
    useGuildStore(
        (s) =>
            s.guilds[guildId]?.roles.filter(
                (r) =>
                    !['@default', '@owner'].includes(r.name) &&
                    memberRoles.some((mr) => mr === r.id),
            ),
    ) ?? [];
