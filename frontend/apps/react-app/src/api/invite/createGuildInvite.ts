import { GuildInvite, AccordApiErrorResponse } from '@accord/common';
import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useCreateGuildInviteMutation = () => {
  return useMutation<
    Pick<GuildInvite, 'id'>,
    AxiosError<AccordApiErrorResponse>,
    { guildId: string }
  >({
    mutationFn: async ({ guildId }) => {
      const { data } = await api.post(`/v1/guilds/${guildId}/invites`);
      return data.invite;
    },
  });
};
