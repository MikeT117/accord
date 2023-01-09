import { useCallback } from 'react';
import { defaultRestrictivePermission } from '@/constants';
import { getChannelPermissions } from '@/utils/getChannelPermission';
import { useGuildStore } from '@/shared-stores/guildStore';

export const useGuildPermission = (guildId: string) => {
  const guildRoles = useGuildStore(useCallback((s) => s.guilds[guildId]?.roles, [guildId]));
  const memberRoles = useGuildStore(useCallback((s) => s.guilds[guildId]?.member.roles, [guildId]));
  if (!guildRoles || !memberRoles) {
    return defaultRestrictivePermission();
  }
  const matchedRoles = guildRoles.filter((gr) => memberRoles.some((mr) => mr === gr.id));
  return getChannelPermissions(matchedRoles);
};
