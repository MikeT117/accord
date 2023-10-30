import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useGuildStore } from '@/shared-stores/guildStore';
import { useGuildSettingsStore } from '../stores/useGuildSettingsStore';

export const useGuildSettings = () => {
  const { guildId = '' } = useParams();

  const guild = useGuildStore(useCallback((s) => s.guilds[guildId], [guildId]));

  const section = useGuildSettingsStore(useCallback((s) => s.section, []));
  const guildRoleId = useGuildSettingsStore(useCallback((s) => s.guildRoleId, []));

  if (!guild) {
    return null;
  }

  const customRoles = guild.roles.filter((r) => !['@default', '@owner'].includes(r.name));
  const defaultRole = guild.roles.find((r) => r.name === '@default');

  if (!defaultRole) {
    return null;
  }

  const editingRole = [defaultRole, ...customRoles].find((r) => r.id === guildRoleId);

  return {
    ...guild,
    memberUserAccountId: guild.member.id,
    section,
    customRoles,
    defaultRole,
    editableRoles: [...customRoles, defaultRole],
    editingRole,
  };
};
