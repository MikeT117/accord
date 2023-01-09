import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useLoggedInUserStore } from '@/shared-stores/loggedInUserStore';
import { useGuildStore } from '@/shared-stores/guildStore';

export const useAppsidebarState = () => {
  const { guildId = '' } = useParams();
  const guilds = useGuildStore((s) => s.ids.map((i) => s.guilds[i]!));
  const avatar = useLoggedInUserStore(useCallback((s) => s.user?.avatar, []));
  const displayName = useLoggedInUserStore(useCallback((s) => s.user?.displayName, []));

  if (!displayName) {
    return null;
  }

  return { activeGuildId: guildId, guilds, user: { avatar, displayName } };
};
