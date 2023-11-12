import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useGuildStore } from '@/shared-stores/guildStore';
import { useCurrentUserStore } from '../../../shared-stores/currentUserStore';

export const useAppsidebarState = () => {
  const { guildId = '' } = useParams();
  const guilds = useGuildStore(useCallback((s) => s.ids.map((i) => s.guilds[i]!), []));
  const user = useCurrentUserStore(useCallback((s) => s.user, []));
  return { activeGuildId: guildId, guilds, user };
};
