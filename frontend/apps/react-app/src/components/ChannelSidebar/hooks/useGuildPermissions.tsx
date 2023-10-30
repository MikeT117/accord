import { useCallback } from 'react';
import { useGuildStore } from '@/shared-stores/guildStore';

export const useGuildPermission = (guildId: string) => {
  const guild = useGuildStore(useCallback((s) => s.guilds[guildId], [guildId]));

  if (!guild) {
    return 0;
  }

  return guild.roles
    .filter((r) => guild.member.roles.some((gmr) => gmr === r.id))
    .reduce((a, b) => {
      return a | b.permissions;
    }, 0);
};
