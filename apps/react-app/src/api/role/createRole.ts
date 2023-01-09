import { GuildRole, AccordApiErrorResponse } from '@accord/common';
import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import {
  guildSettingsActions,
  GUILD_ROLE_EDITOR,
} from '@/components/GuildSettings/stores/useGuildSettingsStore';
import { api } from '@/lib/axios';
import { guildActions } from '@/shared-stores/guildStore';

export const useCreateRoleMutation = () => {
  return useMutation<GuildRole, AxiosError<AccordApiErrorResponse>, Pick<GuildRole, 'guildId'>>(
    async ({ guildId }) => {
      const { data } = await api.post(`/v1/guilds/${guildId}/roles`);
      return data.role;
    },
    {
      onSuccess: (role) => {
        guildActions.addRole(role);
        guildSettingsActions.setRole(role.id);
        guildSettingsActions.setSection(GUILD_ROLE_EDITOR);
      },
    },
  );
};
