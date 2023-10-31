import { AccordApiErrorResponse, ChannelMessage } from '@accord/common';
import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { queryClient } from '@/lib/queryClient/queryClient';
import { InfiniteData } from '@tanstack/react-query';
import { deleteInfiniteDataItem } from '../../lib/queryClient/utils/deleteInfiniteDataItem';

export const useDeleteChannelMessageMutation = () => {
  return useMutation<
    Pick<ChannelMessage, 'id' | 'channelId'>,
    AxiosError<AccordApiErrorResponse>,
    Pick<ChannelMessage, 'id' | 'channelId'>
  >({
    mutationFn: async ({ channelId, id }) => {
      const { data } = await api.delete<{
        message: Pick<ChannelMessage, 'id' | 'channelId'>;
      }>(`/v1/channels/${channelId}/messages/${id}`);

      return data.message;
    },
    onSuccess: (_, { id, channelId }) => {
      queryClient.setQueryData<InfiniteData<ChannelMessage[]>>([channelId, 'messages'], (prev) =>
        deleteInfiniteDataItem(prev, (m) => m.id !== id),
      );
    },
  });
};
