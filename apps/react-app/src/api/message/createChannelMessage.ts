import { AccordApiErrorResponse, Attachment, ChannelMessage } from '@accord/common';
import { AxiosError } from 'axios';
import { InfiniteData, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { queryClient } from '@/lib/queryClient/queryClient';
import { insertInfiniteDataItem } from '../../lib/queryClient/utils/insertInfiniteDataItem';

export const useCreateChannelMessageMutation = () => {
  return useMutation<
    ChannelMessage,
    AxiosError<AccordApiErrorResponse>,
    Pick<ChannelMessage, 'content' | 'channelId'> & {
      attachments?: Omit<Attachment, 'id' | 'channelMessageId'>[];
    }
  >(
    async ({ channelId, content, attachments }) => {
      const { data } = await api.post(`/v1/channels/${channelId}/messages`, {
        content,
        attachments,
      });
      return data.message;
    },
    {
      onSuccess: (message) => {
        queryClient.setQueryData<InfiniteData<ChannelMessage[]>>(
          [message.channelId, 'messages'],
          (prev) => insertInfiniteDataItem(prev, message),
        );
      },
    },
  );
};
