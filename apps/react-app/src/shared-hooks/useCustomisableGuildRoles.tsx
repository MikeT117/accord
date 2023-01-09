import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useGuildStore } from '@/shared-stores/guildStore';

export const useCustomisableGuildRoles = (id?: string) => {
  const { guildId = '' } = useParams();
  const roles = useGuildStore(
    useCallback(
      (s) => s.guilds[id ?? guildId]?.roles.filter((r) => !['@default', '@owner'].includes(r.name)),
      [id, guildId],
    ),
  );

  return roles ?? [];
};
