import { ChannelMessage, AccordApiErrorResponse } from '@accord/common';
import { AxiosError } from 'axios';
import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useGetChannelMessagesQuery = (channelId: string) => {
  return useInfiniteQuery<ChannelMessage[], AxiosError<AccordApiErrorResponse>>(
    [channelId, 'messages'],
    async ({ pageParam = 0 }) => {
      const { data } = await api.get(
        `/v1/channels/${channelId}/messages?offset=${pageParam}&limit=50`,
      );
      return data;
    },
    {
      getNextPageParam: (lastPage, pages) =>
        lastPage.length < 50 ? undefined : pages.flat().length,
      staleTime: Infinity,
      cacheTime: Infinity,
    },
  );
};
