import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getChannelPermissions } from '@/utils/getChannelPermission';
import { useGuildChannelStore } from '@/shared-stores/guildChannelStore';
import { useGuildStore } from '@/shared-stores/guildStore';

export const useGuildTextChannel = () => {
  const { guildId = '', channelId = '' } = useParams();
  const guildRoles = useGuildStore(useCallback((s) => s.guilds[guildId]?.roles, [guildId]));
  const memberRoles = useGuildStore(useCallback((s) => s.guilds[guildId]?.member.roles, [guildId]));
  const channelGuildId = useGuildChannelStore(
    useCallback((s) => s.channels[channelId]?.guildId, [channelId]),
  );
  const name = useGuildChannelStore(useCallback((s) => s.channels[channelId]?.name, [channelId]));
  const type = useGuildChannelStore(useCallback((s) => s.channels[channelId]?.type, [channelId]));
  const channelRoles = useGuildChannelStore(
    useCallback((s) => s.channels[channelId]?.roles, [channelId]),
  );

  if (
    !Array.isArray(guildRoles) ||
    !Array.isArray(memberRoles) ||
    !Array.isArray(channelRoles) ||
    channelGuildId !== guildId ||
    typeof name !== 'string' ||
    typeof type === 'undefined' ||
    type !== 0
  ) {
    return null;
  }

  const matchedRoles = guildRoles.filter(
    (gr) => memberRoles.some((mr) => mr === gr.id) && channelRoles.some((cr) => cr === gr.id),
  );

  const permissions = getChannelPermissions(matchedRoles);

  if (
    !permissions.viewGuildChannel &&
    !permissions.manageGuildChannels &&
    !permissions.guildAdmin &&
    !permissions.manageGuild
  ) {
    return null;
  }

  return { channel: { id: channelId, name, type }, permissions };
};
