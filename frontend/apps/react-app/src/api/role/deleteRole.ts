import { AccordApiErrorResponse } from '@accord/common';
import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { guildStore } from '@/shared-stores/guildStore';

export const useDeleteRoleMutation = () => {
  return useMutation<
    Record<string, never>,
    AxiosError<AccordApiErrorResponse>,
    { roleId: string; guildId: string }
  >({
    mutationFn: async ({ roleId, guildId }) => {
      return api.delete(`/v1/guilds/${guildId}/roles/${roleId}`);
    },
    onSuccess: (_, { roleId, guildId }) => {
      guildStore.deleteRole(roleId, guildId);
    },
  });
};
