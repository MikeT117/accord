import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { z } from 'zod';

type GetDiscoverableGuildsRequestArgs = {
  pageParam: string;
  limit: number;
  query?: string;
};

const getDiscoverableGuildsSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    memberCount: z.number(),
    guildCategoryId: z.string().nullable(),
    createdAt: z.coerce.date(),
    icon: z.string().nullable(),
    banner: z.string().nullable(),
  }),
);

const getDiscoverableGuildsRequest = async ({
  pageParam,
  limit,
  query,
}: GetDiscoverableGuildsRequestArgs) => {
  const before = pageParam ? `before=${pageParam}&` : '';
  const endpoint =
    query && query.length != 0
      ? `/v1/guilds/discoverable?${before}query=${query}&limit=${limit}`
      : `/v1/guilds/discoverable?${before}limit=${limit}`;

  const resp = await api.get(endpoint);
  return getDiscoverableGuildsSchema.parse(resp.data.data);
};

export const useGetDiscoverableGuildsQuery = (limit = 50, query = '') => {
  return useInfiniteQuery({
    queryKey:
      query.trim().length === 0 ? ['guilds', 'discoverable'] : ['guilds', 'discoverable', query],
    initialPageParam: '',
    queryFn: ({ pageParam }) => getDiscoverableGuildsRequest({ pageParam, limit, query }),
    getNextPageParam: (lastPage) =>
      lastPage.length < 50 ? undefined : lastPage[lastPage.length - 1].id,
    getPreviousPageParam: (firstPage) =>
      firstPage.length < 50 ? undefined : firstPage[firstPage.length - 1].id,
    staleTime: 30000,
    gcTime: 30000,
  });
};
