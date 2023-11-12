import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { z } from 'zod';

type GetChannelMessagesRequestArgs = {
  channelId: string;
  pageParam?: string;
  limit: number;
};

const getChannelMessagesResponseSchema = z.array(
  z.object({
    id: z.string(),
    channelId: z.string(),
    content: z.string(),
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
  }),
);

export const getChannelMessagesRequest = async ({
  pageParam,
  limit,
  channelId,
}: GetChannelMessagesRequestArgs) => {
  const before = pageParam ? `before=${pageParam}&` : '';
  const resp = await api.get(`/v1/channels/${channelId}/messages?${before}limit=${limit}`);
  return getChannelMessagesResponseSchema.parse(resp.data.data);
};

export const useGetChannelMessagesQuery = (channelId: string, limit = 50) => {
  return useInfiniteQuery({
    queryKey: [channelId, 'messages'],
    initialPageParam: '',
    queryFn: ({ pageParam }) => getChannelMessagesRequest({ pageParam, channelId, limit }),
    getNextPageParam: (lastPage) =>
      lastPage.length < 50 ? undefined : lastPage[lastPage.length - 1].id,
    getPreviousPageParam: (firstPage) =>
      firstPage.length < 50 ? undefined : firstPage[firstPage.length - 1].id,
    staleTime: Infinity,
    gcTime: Infinity,
  });
};
