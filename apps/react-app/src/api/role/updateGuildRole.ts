import { GuildRole, AccordApiErrorResponse } from '@accord/common';
import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { guildActions } from '@/shared-stores/guildStore';

export const useUpdateRoleMutation = () => {
  return useMutation<GuildRole, AxiosError<AccordApiErrorResponse>, GuildRole>(
    async (role) => {
      const { guildId, id } = role;
      const { data } = await api.patch(`/v1/guilds/${guildId}/roles/${id}`, role);
      return data.role;
    },
    {
      onSuccess: (role) => {
        guildActions.updateRole(role);
      },
    },
  );
};
