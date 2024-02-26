import { GuildRole } from '../../../types';
import { useGuildSettingsStore } from '../stores/useGuildSettingsStore';

export const useEditingRole = (roles: GuildRole[]) => {
    const roleId = useGuildSettingsStore((s) => s.roleId);
    return roles.find((r) => r.id === roleId);
};
