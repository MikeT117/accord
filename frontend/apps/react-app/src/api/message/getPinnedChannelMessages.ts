import { ChannelMessage, AccordApiErrorResponse } from '@accord/common';
import { AxiosError } from 'axios';
import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useGetPinnedChannelMessagesQuery = (channelId: string) => {
  return useInfiniteQuery<ChannelMessage[], AxiosError<AccordApiErrorResponse>>({
    queryKey: [channelId, 'messages', 'pinned'],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const { data } = await api.get(`/v1/channels/${channelId}/pins?offset=${pageParam}&limit=50`);
      return data;
    },
    getNextPageParam: (lastPage, pages) => (lastPage.length < 10 ? undefined : pages.flat().length),
    staleTime: Infinity,
    gcTime: Infinity,
  });
};
