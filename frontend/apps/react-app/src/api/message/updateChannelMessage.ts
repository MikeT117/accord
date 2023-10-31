import { ChannelMessage, AccordApiErrorResponse } from '@accord/common';
import { AxiosError } from 'axios';
import { InfiniteData, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { queryClient } from '@/lib/queryClient/queryClient';
import { updateInfiniteDataItem } from '../../lib/queryClient/utils/updateInfiniteDataItem';

export const useUpdateChannelMessageMutation = () => {
  return useMutation<
    Pick<ChannelMessage, 'id' | 'content' | 'channelId'>,
    AxiosError<AccordApiErrorResponse>,
    Pick<ChannelMessage, 'id' | 'content' | 'channelId'>
  >({
    mutationFn: async ({ id, channelId, content }) => {
      const { data } = await api.patch(`/v1/channels/${channelId}/messages/${id}`, { content });
      return data.message;
    },
    onSuccess: (message) => {
      console.log({ message });
      queryClient.setQueryData<InfiniteData<ChannelMessage[]>>(
        [message.channelId, 'messages'],
        (prev) =>
          updateInfiniteDataItem(prev, (m) => (m.id === message.id ? { ...m, ...message } : m)),
      );
    },
  });
};
