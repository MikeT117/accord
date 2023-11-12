import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { z } from 'zod';

type GetUserSessionsRequestArgs = {
  pageParam: string;
  limit: number;
};

const getUserSessionsResponseSchema = z.array(
  z.object({
    id: z.string(),
    isCurrentSession: z.boolean(),
    createdAt: z.coerce.date(),
    expiresAt: z.coerce.date(),
  }),
);

const getUserSessionsRequest = async ({ pageParam, limit }: GetUserSessionsRequestArgs) => {
  const before = pageParam ? `before=${pageParam}&` : '';
  const resp = await api.get(`/v1/users/@me/sessions?${before}limit=${limit}`);
  return getUserSessionsResponseSchema.parse(resp.data.data);
};

export const useGetUserSessionsQuery = (limit = 50) => {
  return useInfiniteQuery({
    queryKey: ['sessions'],
    initialPageParam: '',
    queryFn: ({ pageParam }) => getUserSessionsRequest({ pageParam, limit }),
    getNextPageParam: (lastPage) =>
      lastPage.length < 50 ? undefined : lastPage[lastPage.length - 1].id,
    getPreviousPageParam: (firstPage) =>
      firstPage.length < 50 ? undefined : firstPage[firstPage.length - 1].id,
    staleTime: Infinity,
    gcTime: Infinity,
  });
};
