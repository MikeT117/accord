import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { defaultRestrictivePermission } from '@/constants';
import { getChannelPermissions } from '@/utils/getChannelPermission';
import { useGuildChannelStore } from '@/shared-stores/guildChannelStore';
import { useGuildStore } from '@/shared-stores/guildStore';

export const useChannelPermissions = (channelId: string) => {
  const { guildId = '' } = useParams();
  const guildMemberRoles = useGuildStore(
    useCallback((s) => s.guilds[guildId]?.member.roles, [guildId]),
  );
  const guildRoles = useGuildStore(useCallback((s) => s.guilds[guildId]?.roles, [guildId]));
  const channelRoles = useGuildChannelStore(
    useCallback((s) => s.channels[channelId]?.roles, [channelId]),
  );

  if (!guildRoles || !channelRoles || !guildMemberRoles) {
    return defaultRestrictivePermission();
  }

  const matchedRoles = guildRoles.filter(
    (gr) => guildMemberRoles.some((mr) => mr === gr.id) && channelRoles?.some((cr) => cr === gr.id),
  );

  return getChannelPermissions(matchedRoles);
};
