import { useCallback } from 'react';
import { useGuildStore } from '@/shared-stores/guildStore';

export const useGuildMemberRoles = (guildId: string, memberRoles: string[]) => {
  const roles = useGuildStore(useCallback((s) => s.guilds[guildId]?.roles, [guildId]));

  if (!roles) {
    return [];
  }

  return roles.filter((r) => memberRoles.some((mr) => mr === r.id));
};
