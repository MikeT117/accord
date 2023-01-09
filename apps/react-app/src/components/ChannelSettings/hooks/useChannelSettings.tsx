import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useGuildStore } from '@/shared-stores/guildStore';
import { useGuildChannelStore } from '@/shared-stores/guildChannelStore';
import { useChannelSettingsStore } from '../stores/useChannelSettingsStore';

export const useChanneSettings = () => {
  const { guildId = '' } = useParams();
  const channelId = useChannelSettingsStore(useCallback((s) => s.channelId ?? '', []));
  const guildRoles = useGuildStore(useCallback((s) => s.guilds[guildId]?.roles, [guildId]));
  const channelRoles = useGuildChannelStore(
    useCallback((s) => s.channels[channelId]?.roles, [channelId]),
  );

  const channelGuildId = useGuildChannelStore(
    useCallback((s) => s.channels[channelId]?.guildId, [channelId]),
  );
  const topic = useGuildChannelStore(useCallback((s) => s.channels[channelId]?.topic, [channelId]));
  const name = useGuildChannelStore(useCallback((s) => s.channels[channelId]?.name, [channelId]));
  const type = useGuildChannelStore(useCallback((s) => s.channels[channelId]?.type, [channelId]));
  const parentId = useGuildChannelStore(
    useCallback((s) => s.channels[channelId]?.parentId, [channelId]),
  );
  const parentRoleSync = useGuildChannelStore(
    useCallback((s) => s.channels[channelId]?.parentRoleSync, [channelId]),
  );
  const section = useChannelSettingsStore(useCallback((s) => s.section, []));
  const defaultRole = guildRoles?.find((r) => r.name === '@default');

  if (
    channelGuildId !== guildId ||
    !defaultRole ||
    !Array.isArray(guildRoles) ||
    !Array.isArray(channelRoles) ||
    typeof name !== 'string' ||
    typeof type !== 'number' ||
    typeof parentRoleSync !== 'boolean'
  ) {
    return null;
  }

  const isPrivate = channelRoles.find((cr) => cr === defaultRole?.id) === undefined;

  const assignedRoles = guildRoles.filter(
    (r) =>
      channelRoles.some((cr) => cr === r.id) && !['@default', '@owner'].some((n) => n === r.name),
  );

  const unassignedRoles = guildRoles.filter(
    (r) =>
      !channelRoles.some((cr) => cr === r.id) && !['@default', '@owner'].some((n) => n === r.name),
  );

  return {
    channel: {
      id: channelId,
      guildId,
      topic,
      name,
      type,
      parentId,
      parentRoleSync,
      isPrivate,
    },
    assignedRoles,
    unassignedRoles,
    defaultRole,
    section,
  };
};
