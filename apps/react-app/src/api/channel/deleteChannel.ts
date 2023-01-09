import { AccordApiErrorResponse, Channel } from '@accord/common';
import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { queryClient } from '@/lib/queryClient/queryClient';
import { guildChannelActions } from '@/shared-stores/guildChannelStore';

export const useDeleteChannelMutation = () => {
  return useMutation<
    undefined,
    AxiosError<AccordApiErrorResponse>,
    Pick<Channel, 'id' | 'type' | 'guildId'>
  >(
    async ({ id }) => {
      const { data } = await api.delete(`/v1/channels/${id}`);
      return data.channel;
    },
    {
      onSuccess: (_, { id, type }) => {
        if (type === 0 || type === 1 || type === 4) {
          guildChannelActions.deleteChannel(id);
        }
        queryClient.invalidateQueries([id, 'messages']);
      },
    },
  );
};
