import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { z } from 'zod';

const getGuildRoleMembersResponseSchema = z.array(
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

type GetGuildRoleMembersRequestArg = {
  guildId: string;
  roleId: string;
  assignable: boolean;
  pageParam: string;
  limit: number;
};

const getGuildRoleMembersRequest = async ({
  pageParam,
  guildId,
  assignable,
  limit,
  roleId,
}: GetGuildRoleMembersRequestArg) => {
  const before = pageParam ? `before=${pageParam}&` : '';
  const resp = await api.get(
    `/v1/guilds/${guildId}/roles/${roleId}/members?${before}limit=${limit}&assignable=${assignable}`,
  );
  return getGuildRoleMembersResponseSchema.parse(resp.data.data);
};

export const useGetGuildRoleMembersQuery = (
  guildId: string,
  roleId: string,
  assignable = false,
  limit = 50,
) => {
  return useInfiniteQuery({
    queryKey: [guildId, 'roles', roleId, 'members', assignable],
    initialPageParam: '',
    queryFn: ({ pageParam }) =>
      getGuildRoleMembersRequest({ pageParam, guildId, limit, roleId, assignable }),
    getNextPageParam: (lastPage) =>
      lastPage.length < 50 ? undefined : lastPage[lastPage.length - 1].user.id,
    getPreviousPageParam: (firstPage) =>
      firstPage.length < 50 ? undefined : firstPage[firstPage.length - 1].user.id,
    gcTime: 0,
    staleTime: 0,
  });
};
