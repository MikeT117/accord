import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { z } from 'zod';

const getGuildInvitesResponseSchema = z.array(
  z.object({
    id: z.string(),
    flags: z.number(),
    usedCount: z.number(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    creator: z.object({
      id: z.string(),
      avatar: z.string().nullable(),
      displayName: z.string(),
      username: z.string(),
      publicFlags: z.number(),
    }),
  }),
);

type GetGuildInvitesRequestArgs = {
  guildId: string;
  pageParam: string;
  limit: number;
};

const getGuildInvitesRequest = async ({
  pageParam,
  guildId,
  limit,
}: GetGuildInvitesRequestArgs) => {
  const before = pageParam ? `before=${pageParam}&` : '';

  const resp = await api.get(`/v1/guilds/${guildId}/invites?${before}limit=${limit}`);
  return getGuildInvitesResponseSchema.parse(resp.data.data);
};

export const useGetGuildInvitesQuery = (guildId: string, limit = 50) => {
  return useInfiniteQuery({
    queryKey: [guildId, 'invites'],
    initialPageParam: '',
    queryFn: ({ pageParam }) => getGuildInvitesRequest({ pageParam, guildId, limit }),
    getNextPageParam: (lastPage) =>
      lastPage.length < 50 ? undefined : lastPage[lastPage.length - 1].id,
    getPreviousPageParam: (firstPage) =>
      firstPage.length < 50 ? undefined : firstPage[firstPage.length - 1].id,
    staleTime: Infinity,
    gcTime: Infinity,
  });
};
