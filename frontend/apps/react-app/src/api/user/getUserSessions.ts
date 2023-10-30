import { AccordApiErrorResponse, UserSession } from '@accord/common';
import { AxiosError } from 'axios';
import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useGetUserSessionsQuery = () => {
  return useInfiniteQuery<
    Pick<UserSession, 'id' | 'createdAt' | 'isCurrentSession'>[],
    AxiosError<AccordApiErrorResponse>
  >(
    ['sessions'],
    async ({ pageParam = 0 }) => {
      const { data } = await api.get(`/v1/users/@me/sessions?offset=${pageParam}&limit=50`);
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
