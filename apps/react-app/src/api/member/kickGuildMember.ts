import { AccordApiErrorResponse, GuildMember } from '@accord/common';
import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { queryClient } from '@/lib/queryClient/queryClient';

export const useKickGuildMemberMutation = () => {
  return useMutation<
    Record<string, never>,
    AxiosError<AccordApiErrorResponse>,
    Pick<GuildMember, 'id' | 'guildId'>
  >(
    async ({ guildId, id }) => {
      return api.delete(`/v1/guilds/${guildId}/members/${id}`);
    },
    {
      onSuccess: (_, { guildId, id }) => {
        queryClient.setQueryData<GuildMember[] | undefined>([guildId, 'members'], (prev) =>
          Array.isArray(prev) ? prev.filter((m) => m.id !== id) : prev,
        );
      },
    },
  );
};
