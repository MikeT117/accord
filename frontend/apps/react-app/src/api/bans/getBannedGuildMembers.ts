import type { GuildMember } from '@accord/common';
import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useInfiniteGuildMemberBansQuery = (guildId: string) => {
  return useInfiniteQuery({
    queryKey: [guildId, 'bans'],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const { data } = await api.get<Omit<GuildMember, 'roles'>[]>(
        `/v1/guilds/${guildId}/bans?offset=${pageParam}&limit=50`,
      );
      return data;
    },
    getNextPageParam: (lastPage, pages) => (lastPage.length < 50 ? undefined : pages.flat().length),
    staleTime: Infinity,
    gcTime: Infinity,
  });
};
