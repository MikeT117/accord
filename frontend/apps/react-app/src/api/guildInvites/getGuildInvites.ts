import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { z } from 'zod';
import { QUERY_LIMIT } from '../../constants';

const getGuildInvitesResponseSchema = z.array(
    z.object({
        id: z.string(),
        flags: z.number(),
        usedCount: z.number(),
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

const getGuildInvitesRequest = async (guildId: string, pageParam: string) => {
    const before = pageParam ? `before=${pageParam}&` : '';
    const resp = await api.get(`/v1/guilds/${guildId}/invites?${before}limit=${QUERY_LIMIT}`);
    return getGuildInvitesResponseSchema.parse(resp.data.data);
};

export const useInfiniteGuildInvitesQuery = (guildId: string) => {
    return useInfiniteQuery({
        queryKey: [guildId, 'invites'],
        initialPageParam: '',
        queryFn: ({ pageParam }) => getGuildInvitesRequest(guildId, pageParam),
        getNextPageParam: (lastPage) =>
            lastPage.length < QUERY_LIMIT ? undefined : lastPage[lastPage.length - 1].id,
        getPreviousPageParam: (firstPage) =>
            firstPage.length < QUERY_LIMIT ? undefined : firstPage[firstPage.length - 1].id,
        staleTime: Infinity,
        gcTime: Infinity,
    });
};
