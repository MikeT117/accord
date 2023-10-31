import { GuildRole, AccordApiErrorResponse } from '@accord/common';
import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import {
  guildSettingsStore,
  GUILD_ROLE_EDITOR,
} from '@/components/GuildSettings/stores/useGuildSettingsStore';
import { api } from '@/lib/axios';
import { guildStore } from '@/shared-stores/guildStore';

export const useCreateRoleMutation = () => {
  return useMutation<GuildRole, AxiosError<AccordApiErrorResponse>, Pick<GuildRole, 'guildId'>>({
    mutationFn: async ({ guildId }) => {
      const { data } = await api.post(`/v1/guilds/${guildId}/roles`);
      return data.role;
    },
    onSuccess: (role) => {
      guildStore.createRole(role);
      guildSettingsStore.setRole(role.id);
      guildSettingsStore.setSection(GUILD_ROLE_EDITOR);
    },
  });
};
