import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { queryClient } from '@/lib/queryClient/queryClient';
import { GuildMember } from '../../types';

type DeleteGuildMemberRequestArgs = {
  id: string;
  guildId: string;
};

const deleteGuildMemberRequest = async ({ guildId, id }: DeleteGuildMemberRequestArgs) => {
  return api.delete(`/v1/guilds/${guildId}/members/${id}`);
};

export const useDeleteGuildMemberMutation = () => {
  return useMutation({
    mutationFn: deleteGuildMemberRequest,
    onSuccess: (_, { guildId, id }) => {
      queryClient.setQueryData<GuildMember[] | undefined>([guildId, 'members'], (prev) =>
        Array.isArray(prev) ? prev.filter((m) => m.user.id !== id) : prev,
      );
    },
  });
};
