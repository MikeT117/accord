import { AccordApiErrorResponse, ChannelMessage } from '@accord/common';
import { AxiosError } from 'axios';
import { useMutation, InfiniteData } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { queryClient } from '@/lib/queryClient/queryClient';
import { deleteInfiniteDataItem } from '../../lib/queryClient/utils/deleteInfiniteDataItem';
import { updateInfiniteDataItem } from '../../lib/queryClient/utils/updateInfiniteDataItem';

export const useUnpinChannelMessageMutation = () => {
  return useMutation<
    Record<string, never>,
    AxiosError<AccordApiErrorResponse>,
    Pick<ChannelMessage, 'id' | 'channelId'>
  >({
    mutationFn: async ({ id, channelId }) => {
      return api.delete(`/v1/channels/${channelId}/pins/${id}`);
    },
    onSuccess: (_, { id, channelId }) => {
      queryClient.setQueryData<InfiniteData<ChannelMessage[]>>([channelId, 'messages'], (prev) =>
        updateInfiniteDataItem(prev, (m) => (m.id === id ? { ...m, isPinned: false } : m)),
      );
      queryClient.setQueryData<InfiniteData<ChannelMessage[]>>(
        [channelId, 'messages', 'pinned'],
        (prev) => deleteInfiniteDataItem(prev, (m) => m.id === id),
      );
    },
  });
};
