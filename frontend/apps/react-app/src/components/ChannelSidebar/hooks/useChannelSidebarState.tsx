import { useParams } from 'react-router-dom';
import { useGuildStore } from '@/shared-stores/guildStore';
import { historyStore } from '@/shared-stores/historyStore';

const { setGuildId } = historyStore;

export const useChannelSidebarState = () => {
  const { guildId = '', channelId = '' } = useParams();
  const guild = useGuildStore((s) => s.guilds[guildId]);

  if (!guild) {
    return null;
  }

  const viewableGuildRoles = guild.roles.filter((r) => r.permissions & (1 << 0));
  const viewableMemberRoles = guild.member.roles.filter((id) =>
    viewableGuildRoles.some((vgr) => vgr.id === id),
  );

  const channels = guild.channels.filter(
    (c) =>
      c.guildId === guildId &&
      c.roles.filter((r) => viewableMemberRoles?.some((vmr) => vmr === r)).length !== 0,
  );

  setGuildId(guildId);

  return {
    guildId,
    channelId,
    ownerUserAccountId: guild.creatorId,
    name: guild.name,
    channels,
  };
};
