import { GuildRole, AccordApiErrorResponse } from '@accord/common';
import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { guildStore } from '@/shared-stores/guildStore';

export const useUpdateRoleMutation = () => {
  return useMutation<GuildRole, AxiosError<AccordApiErrorResponse>, GuildRole>({
    mutationFn: async (role) => {
      const { guildId, id } = role;
      const { data } = await api.patch(`/v1/guilds/${guildId}/roles/${id}`, role);
      return data.role;
    },
    onSuccess: (role) => {
      guildStore.updateRole(role);
    },
  });
};
