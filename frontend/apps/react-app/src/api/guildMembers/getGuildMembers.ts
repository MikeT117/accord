import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { z } from 'zod';
import { useCallback } from 'react';
import { QUERY_LIMIT } from '../../constants';

const getGuildMembersResponseSchema = z.array(
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

const getGuildMembersRequest = async (guildId: string, pageParam: string) => {
    const before = pageParam ? `before=${pageParam}&` : '';
    const resp = await api.get(`/v1/guilds/${guildId}/members?${before}limit=${QUERY_LIMIT}`);
    return getGuildMembersResponseSchema.parse(resp.data.data);
};

export const useInfiniteGuildMembersQuery = (guildId: string, filter = '') => {
    return useInfiniteQuery({
        queryKey: [guildId, 'members'],
        initialPageParam: '',
        queryFn: ({ pageParam }) => getGuildMembersRequest(guildId, pageParam),
        getNextPageParam: (lastPage) =>
            lastPage.length < QUERY_LIMIT ? undefined : lastPage[lastPage.length - 1].user.id,
        getPreviousPageParam: (firstPage) =>
            firstPage.length < QUERY_LIMIT ? undefined : firstPage[firstPage.length - 1].user.id,
        staleTime: Infinity,
        gcTime: Infinity,
        select: useCallback(
            (data: InfiniteData<z.infer<typeof getGuildMembersResponseSchema>>) => {
                if (!filter.trim()) {
                    return data.pages;
                }
                return data.pages.map((p) =>
                    p.filter((gm) =>
                        gm.user.displayName.toLowerCase().includes(filter.toLowerCase()),
                    ),
                );
            },
            [filter],
        ),
    });
};
