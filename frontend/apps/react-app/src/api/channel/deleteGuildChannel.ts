import { AccordApiErrorResponse, GuildChannel } from '@accord/common';
import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { queryClient } from '@/lib/queryClient/queryClient';
import { guildStore } from '../../shared-stores/guildStore';

export const useDeleteGuildChannelMutation = () => {
  return useMutation<
    undefined,
    AxiosError<AccordApiErrorResponse>,
    Pick<GuildChannel, 'id' | 'guildId'>
  >(
    async ({ id }) => {
      const { data } = await api.delete(`/v1/channels/${id}`);
      return data.channel;
    },
    {
      onSuccess: (_, args) => {
        guildStore.deleteChannel(args.id, args.guildId);
        queryClient.invalidateQueries([args.id, 'messages']);
      },
    },
  );
};
