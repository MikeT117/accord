import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { z } from 'zod';

type GetGuildBansRequestArgs = {
  guildId: string;
  pageParam: string;
  limit: number;
};

const getGuildBansResponseSchema = z.array(
  z.object({
    reason: z.string(),
    bannedAt: z.coerce.date(),
    user: z.object({
      id: z.string(),
      avatar: z.string().nullable(),
      displayName: z.string(),
      username: z.string(),
      publicFlags: z.number(),
    }),
  }),
);

const getGuildBansRequest = async ({ pageParam, guildId, limit }: GetGuildBansRequestArgs) => {
  const before = pageParam ? `before=${pageParam}&` : '';
  const resp = await api.get(`/v1/guilds/${guildId}/bans?before=${before}&limit=${limit}`);
  return getGuildBansResponseSchema.parse(resp.data.data);
};

export const useGetGuildBansQuery = (guildId: string, limit = 50) => {
  return useInfiniteQuery({
    queryKey: [guildId, 'bans'],
    initialPageParam: '',
    queryFn: ({ pageParam }) => getGuildBansRequest({ guildId, pageParam, limit }),
    getNextPageParam: (lastPage) =>
      lastPage.length < 50 ? undefined : lastPage[lastPage.length - 1].user.id,
    getPreviousPageParam: (firstPage) =>
      firstPage.length < 50 ? undefined : firstPage[firstPage.length - 1].user.id,
    staleTime: Infinity,
    gcTime: Infinity,
  });
};
