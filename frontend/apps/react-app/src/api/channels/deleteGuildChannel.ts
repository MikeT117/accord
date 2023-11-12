import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { queryClient } from '@/lib/queryClient/queryClient';
import { guildStore } from '../../shared-stores/guildStore';

type DeleteGuildChannelRequestArgs = {
  id: string;
  guildId: string;
};

const deleteGuildChannelRequest = async ({ id }: DeleteGuildChannelRequestArgs) => {
  return api.delete(`/v1/channels/${id}`);
};

export const useDeleteGuildChannelMutation = () => {
  return useMutation({
    mutationFn: deleteGuildChannelRequest,
    onSuccess: (_, { guildId, id }) => {
      guildStore.deleteChannel(id, guildId);
      queryClient.invalidateQueries({ queryKey: [id], exact: false });
    },
  });
};
