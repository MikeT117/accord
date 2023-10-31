import { AccordApiErrorResponse } from '@accord/common';
import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useSyncGuildChannelRolesWithParentMutation = () => {
  return useMutation<
    Record<string, never>,
    AxiosError<AccordApiErrorResponse>,
    { channelId: string; guildId: string }
  >({
    mutationFn: async ({ channelId, guildId }) => {
      return api.post(`/v1/guilds/${guildId}/channels/${channelId}/permissions/sync`);
    },
  });
};
