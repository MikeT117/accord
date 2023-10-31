import { AccordApiErrorResponse, GuildMember } from '@accord/common';
import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useInfiniteGuildMembersQuery = (guildId: string) => {
  return useInfiniteQuery<GuildMember[], AccordApiErrorResponse>({
    queryKey: [guildId, 'members'],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const { data } = await api.get(`/v1/guilds/${guildId}/members?offset=${pageParam}&limit=50`);
      return data;
    },
    getNextPageParam: (lastPage, pages) => (lastPage.length < 50 ? undefined : pages.flat().length),
    staleTime: Infinity,
    gcTime: Infinity,
  });
};
