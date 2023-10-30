import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useChannelSettingsStore } from '../stores/useChannelSettingsStore';
import { useGuildStore } from '@/shared-stores/guildStore';

export const useChanneSettings = () => {
  const { guildId = '' } = useParams();
  const channelId = useChannelSettingsStore(useCallback((s) => s.channelId ?? '', []));
  const guild = useGuildStore(useCallback((s) => s.guilds[guildId], []));
  const section = useChannelSettingsStore(useCallback((s) => s.section, []));

  if (!guild) {
    return null;
  }

  const channel = guild.channels.find((c) => c.id === channelId);

  if (!channel) {
    return null;
  }

  const defaultRole = guild.roles?.find((r) => r.name === '@default');

  if (!defaultRole) {
    return null;
  }

  const isPrivate = channel.roles.find((cr) => cr === defaultRole.id) === undefined;

  const assignedRoles = guild.roles.filter(
    (r) =>
      channel.roles.some((cr) => cr === r.id) && !['@default', '@owner'].some((n) => n === r.name),
  );

  const unassignedRoles = guild.roles.filter(
    (r) =>
      !channel.roles.some((cr) => cr === r.id) && !['@default', '@owner'].some((n) => n === r.name),
  );

  console.log(guild.roles);

  return {
    channel,
    isPrivate,
    assignedRoles,
    unassignedRoles,
    defaultRole,
    section,
  };
};
