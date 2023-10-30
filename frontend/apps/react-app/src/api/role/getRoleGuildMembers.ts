import { GuildMember, AccordApiErrorResponse } from '@accord/common';
import { AxiosError } from 'axios';
import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useGetRoleGuildMembersQuery = ({
  isAssigned,
  guildId,
  roleId,
}: {
  guildId: string;
  roleId: string;
  isAssigned: boolean;
}) => {
  return useInfiniteQuery<Omit<GuildMember, 'roles'>[], AxiosError<AccordApiErrorResponse>>(
    [guildId, 'roles', roleId, 'members', 'assigned', isAssigned.toString()],
    async ({ pageParam = 0 }) => {
      const endpoint = `/v1/guilds/${guildId}/roles/${roleId}/members?assigned=${isAssigned}&offset=${
        1 * pageParam
      }&limit=10`;

      const { data } = await api.get(endpoint);
      return data;
    },
    {
      cacheTime: 0,
      staleTime: 0,
      getNextPageParam: (lastPage, pages) => (lastPage.length === 0 ? undefined : pages.length),
    },
  );
};
