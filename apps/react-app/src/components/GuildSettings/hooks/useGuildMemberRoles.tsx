import { useCallback, useMemo } from 'react';
import { useGuildStore } from '@/shared-stores/guildStore';

export const useGuildMemberRoles = (guildId: string, roles: string[]) => {
  const guildRoles = useGuildStore(useCallback((s) => s.guilds[guildId]?.roles, [guildId]));
  return (
    useMemo(
      () =>
        guildRoles?.filter((gr) =>
          roles.some((id) => id === gr.id && !['@owner', '@default'].includes(gr.name)),
        ),
      [roles, guildRoles],
    ) ?? []
  );
};
