import { InfiniteData, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { queryClient } from '@/lib/queryClient/queryClient';
import { updateInfiniteDataItem } from '../../lib/queryClient/utils/updateInfiniteDataItem';
import { z } from 'zod';
import { ChannelMessage } from '../../types';

type UpdateChannelMessageRequestArgs = {
  id: string;
  channelId: string;
  content: string;
};

const updatedChannelMessageResponseSchema = z.object({
  id: z.string(),
  channelId: z.string(),
  content: z.string(),
  isPinned: z.boolean(),
  updatedAt: z.coerce.date(),
});

const updateChannelMessageRequest = async ({
  channelId,
  content,
  id,
}: UpdateChannelMessageRequestArgs) => {
  const resp = await api.patch(`/v1/channels/${channelId}/messages/${id}`, { content });
  return updatedChannelMessageResponseSchema.parse(resp.data.data);
};

export const useUpdateChannelMessageMutation = () => {
  return useMutation({
    mutationFn: updateChannelMessageRequest,
    onSuccess: (resp) => {
      queryClient.setQueryData<InfiniteData<ChannelMessage[]>>(
        [resp.channelId, 'messages'],
        (prev) => updateInfiniteDataItem(prev, (m) => (m.id === resp.id ? { ...m, ...resp } : m)),
      );
    },
  });
};
