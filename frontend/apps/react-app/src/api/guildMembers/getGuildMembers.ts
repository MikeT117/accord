import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { z } from 'zod';

type GetGuildMembersRequestArgs = {
  guildId: string;
  pageParam: string;
  limit: number;
};

const getGuildMembersRespone = z.array(
  z.object({
    joinedAt: z.coerce.date(),
    roles: z.array(z.string()),
    user: z.object({
      id: z.string(),
      avatar: z.string().nullable(),
      displayName: z.string(),
      username: z.string(),
      publicFlags: z.number(),
    }),
  }),
);

const getGuildMembersRequest = async ({
  guildId,
  pageParam,
  limit,
}: GetGuildMembersRequestArgs) => {
  const before = pageParam ? `before=${pageParam}&` : '';
  const resp = await api.get(`/v1/guilds/${guildId}/members?${before}limit=${limit}`);
  return getGuildMembersRespone.parse(resp.data.data);
};

export const useInfiniteGuildMembersQuery = (guildId: string, limit = 50) => {
  return useInfiniteQuery({
    queryKey: [guildId, 'members'],
    initialPageParam: '',
    queryFn: ({ pageParam }) => getGuildMembersRequest({ guildId, pageParam, limit }),
    getNextPageParam: (lastPage) =>
      lastPage.length < 50 ? undefined : lastPage[lastPage.length - 1].user.id,
    getPreviousPageParam: (firstPage) =>
      firstPage.length < 50 ? undefined : firstPage[firstPage.length - 1].user.id,
    staleTime: Infinity,
    gcTime: Infinity,
  });
};
