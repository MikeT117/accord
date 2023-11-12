import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { z } from 'zod';

type getChannelPinsRequestArgs = {
  channelId: string;
  pageParam: string;
  limit: number;
};

const getChannelPinsResponseSchema = z.array(
  z.object({
    id: z.string(),
    channelId: z.string(),
    content: z.string(),
    isPinned: z.boolean(),
    flags: z.number(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
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

const getChannelPinsRequest = async ({
  pageParam,
  limit,
  channelId,
}: getChannelPinsRequestArgs) => {
  const before = pageParam ? `before=${pageParam}&` : '';
  const resp = await api.get(`/v1/channels/${channelId}/pins?${before}limit=${limit}`);
  return getChannelPinsResponseSchema.parse(resp.data.data);
};

export const useGetChannelPinsQuery = (channelId: string, limit = 50) => {
  return useInfiniteQuery({
    queryKey: [channelId, 'messages', 'pins'],
    initialPageParam: '',
    queryFn: ({ pageParam }) => getChannelPinsRequest({ pageParam, channelId, limit }),
    getNextPageParam: (lastPage) =>
      lastPage.length < 50 ? undefined : lastPage[lastPage.length - 1].id,
    getPreviousPageParam: (firstPage) =>
      firstPage.length < 50 ? undefined : firstPage[firstPage.length - 1].id,
    staleTime: Infinity,
    gcTime: Infinity,
  });
};
