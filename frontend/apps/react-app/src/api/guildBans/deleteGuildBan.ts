import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { queryClient } from '@/lib/queryClient/queryClient';

type DeleteGuildBanMutationArgs = {
  userId: string;
  guildId: string;
};

const deleteGuildBanRequest = ({ guildId, userId }: DeleteGuildBanMutationArgs) => {
  return api.delete(`/v1/guilds/${guildId}/bans/${userId}`);
};

export const useDeleteGuildBanMutation = () => {
  return useMutation({
    mutationFn: deleteGuildBanRequest,
    onSuccess: (_, args) => {
      queryClient.invalidateQueries({ queryKey: [args.guildId, 'bans'] });
    },
  });
};
