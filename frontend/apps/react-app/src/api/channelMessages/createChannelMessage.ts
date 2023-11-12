import { InfiniteData, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { queryClient } from '@/lib/queryClient/queryClient';
import { insertInfiniteDataItem } from '../../lib/queryClient/utils/insertInfiniteDataItem';
import { ChannelMessage } from '@/types';
import { z } from 'zod';

type CreateChannelMessageRequestArgs = {
  channelId: string;
  content?: string;
  attachments?: string[];
};

const createChannelMessageResponseSchema = z.object({
  id: z.string(),
  channelId: z.string(),
  content: z.string().nullable(),
  isPinned: z.boolean(),
  flags: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable(),
  author: z.object({
    id: z.string(),
    avatar: z.string().nullable(),
    displayName: z.string(),
    username: z.string(),
    publicFlags: z.number(),
  }),
  attachments: z.array(z.string()),
});

const createChannelMessageRequest = async ({
  channelId,
  attachments,
  content,
}: CreateChannelMessageRequestArgs) => {
  const resp = await api.post(`/v1/channels/${channelId}/messages`, {
    content,
    attachments,
  });
  return createChannelMessageResponseSchema.parse(resp.data.data);
};

export const useCreateChannelMessageMutation = () => {
  return useMutation({
    mutationFn: createChannelMessageRequest,
    onSuccess: (message) => {
      queryClient.setQueryData<InfiniteData<ChannelMessage[]>>(
        [message.channelId, 'messages'],
        (prev) => insertInfiniteDataItem(prev, message),
      );
    },
  });
};
