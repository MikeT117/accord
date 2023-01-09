import { AccordApiErrorResponse, ChannelMessage } from '@accord/common';
import { AxiosError } from 'axios';
import { InfiniteData, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { queryClient } from '@/lib/queryClient/queryClient';
import { updateInfiniteDataItem } from '../../lib/queryClient/utils/updateInfiniteDataItem';
import { insertInfiniteDataItem } from '../../lib/queryClient/utils/insertInfiniteDataItem';

export const usePinChannelMessageMutation = () => {
  return useMutation<undefined, AxiosError<AccordApiErrorResponse>, ChannelMessage>(
    async ({ id, channelId }) => {
      return api.put(`/v1/channels/${channelId}/pins/${id}`);
    },
    {
      onSuccess: (_, message) => {
        queryClient.setQueryData<InfiniteData<ChannelMessage[]>>(
          [message.channelId, 'messages'],
          (prev) =>
            updateInfiniteDataItem(prev, (m) =>
              m.id === message.id ? { ...message, isPinned: true } : m,
            ),
        );

        queryClient.setQueryData<InfiniteData<ChannelMessage[]>>(
          [message.channelId, 'messages', 'pinned'],
          (prev) => insertInfiniteDataItem(prev, message),
        );
      },
    },
  );
};
