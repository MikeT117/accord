import { AccordApiErrorResponse } from '@accord/common';
import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useUnassignGuildChannelFromRoleMutation = () => {
  return useMutation<
    Record<string, never>,
    AxiosError<AccordApiErrorResponse>,
    { roleId: string; channelId: string; guildId: string }
  >({
    mutationFn: async ({ channelId, guildId, roleId }) => {
      return api.delete(`/v1/guilds/${guildId}/roles/${roleId}/channels/${channelId}`);
    },
  });
};
