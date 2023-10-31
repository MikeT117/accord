import { GuildInvite, AccordApiErrorResponse } from '@accord/common';
import { AxiosError } from 'axios';
import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useGetGuildInvitesQuery = (guildId: string) => {
  return useInfiniteQuery<GuildInvite[], AxiosError<AccordApiErrorResponse>>({
    queryKey: [guildId, 'invites'],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const { data } = await api.get(`/v1/guilds/${guildId}/invites?offset=${pageParam}&limit=50`);
      return data;
    },
    getNextPageParam: (lastPage, pages) => (lastPage.length < 50 ? undefined : pages.flat().length),
    staleTime: Infinity,
    gcTime: Infinity,
  });
};
