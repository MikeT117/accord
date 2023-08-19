import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useGuildChannelStore } from '@/shared-stores/guildChannelStore';
import { useGuildStore } from '@/shared-stores/guildStore';
import { historyStore } from '@/shared-stores/historyStore';

const { setGuildId } = historyStore;

export const useChannelSidebarState = () => {
  const { guildId = '', channelId = '' } = useParams();
  const viewableGuildRoles = useGuildStore(
    useCallback((s) => s.guilds[guildId]?.roles.filter((r) => r.viewGuildChannel), [guildId]),
  );
  const viewableMemberRoles = useGuildStore(
    useCallback(
      (s) =>
        s.guilds[guildId]?.member.roles.filter((id) =>
          viewableGuildRoles?.some((vgr) => vgr.id === id),
        ),
      [guildId, viewableGuildRoles],
    ),
  );
  const name = useGuildStore(useCallback((s) => s.guilds[guildId]?.name, [guildId]));
  const ownerUserAccountId = useGuildStore(
    useCallback((s) => s.guilds[guildId]?.ownerUserAccountId, [guildId]),
  );
  const channels = useGuildChannelStore(
    useCallback(
      (s) =>
        s.ids
          .map((i) => s.channels[i]!)
          .filter(
            (c) =>
              c.guildId === guildId &&
              c.roles.filter((r) => viewableMemberRoles?.some((vmr) => vmr === r)).length !== 0,
          ),
      [guildId, viewableMemberRoles],
    ),
  );

  if (!name || !ownerUserAccountId) {
    return null;
  }

  setGuildId(guildId);

  return { guildId, channelId, ownerUserAccountId, name, channels };
};
