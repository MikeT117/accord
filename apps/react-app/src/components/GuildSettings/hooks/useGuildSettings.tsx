import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useCustomisableGuildRoles } from '@/shared-hooks/useCustomisableGuildRoles';
import { useGuildStore } from '@/shared-stores/guildStore';
import { useGuildSettingsStore } from '../stores/useGuildSettingsStore';

export const useGuildSettings = () => {
  const { guildId = '' } = useParams();
  const name = useGuildStore(useCallback((s) => s.guilds[guildId]?.name, [guildId]));
  const description = useGuildStore(useCallback((s) => s.guilds[guildId]?.description, [guildId]));
  const isDiscoverable = useGuildStore(
    useCallback((s) => s.guilds[guildId]?.isDiscoverable, [guildId]),
  );
  const icon = useGuildStore(useCallback((s) => s.guilds[guildId]?.icon, [guildId]));
  const banner = useGuildStore(useCallback((s) => s.guilds[guildId]?.banner, [guildId]));
  const guildCategoryId = useGuildStore(
    useCallback((s) => s.guilds[guildId]?.guildCategoryId, [guildId]),
  );
  const ownerUserAccountId = useGuildStore(
    useCallback((s) => s.guilds[guildId]?.ownerUserAccountId, [guildId]),
  );
  const memberUserAccountId = useGuildStore(
    useCallback((s) => s.guilds[guildId]?.member.id, [guildId]),
  );
  const memberCount = useGuildStore(useCallback((s) => s.guilds[guildId]?.memberCount, [guildId]));
  const section = useGuildSettingsStore(useCallback((s) => s.section, []));
  const guildRoleId = useGuildSettingsStore(useCallback((s) => s.guildRoleId, []));
  const customRoles = useCustomisableGuildRoles();

  const defaultRole = useGuildStore(
    useCallback((s) => s.guilds[guildId]?.roles.find((r) => r.name === '@default'), [guildId]),
  );

  if (
    !Array.isArray(customRoles) ||
    !defaultRole ||
    !name ||
    !ownerUserAccountId ||
    !memberUserAccountId ||
    !memberCount ||
    !guildCategoryId ||
    typeof isDiscoverable === 'undefined'
  ) {
    return null;
  }

  const editingRole = [defaultRole, ...customRoles].find((r) => r.id === guildRoleId);

  return {
    id: guildId,
    name,
    description,
    isDiscoverable,
    guildCategoryId,
    icon,
    banner,
    section,
    ownerUserAccountId,
    memberUserAccountId,
    memberCount,
    customRoles,
    defaultRole,
    editableRoles: [...customRoles, defaultRole],
    editingRole,
  };
};
