import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { z } from 'zod';
import { useCallback } from 'react';
import { QUERY_LIMIT } from '../../constants';

const getGuildBansResponseSchema = z.array(
    z.object({
        id: z.string(),
        reason: z.string(),
        user: z.object({
            id: z.string(),
            avatar: z.string().nullable(),
            displayName: z.string(),
            username: z.string(),
            publicFlags: z.number(),
        }),
    }),
);

const getGuildBansRequest = async (guildId: string, pageParam: string) => {
    const before = pageParam ? `before=${pageParam}&` : '';
    const resp = await api.get(`/v1/guilds/${guildId}/bans?before=${before}&limit=${QUERY_LIMIT}`);
    return getGuildBansResponseSchema.parse(resp.data.data);
};

export const useInfiniteGuildBansQuery = (guildId: string, filter = '') => {
    return useInfiniteQuery({
        queryKey: [guildId, 'bans'],
        initialPageParam: '',
        queryFn: ({ pageParam }) => getGuildBansRequest(guildId, pageParam),
        getNextPageParam: (lastPage) =>
            lastPage.length < QUERY_LIMIT ? undefined : lastPage[lastPage.length - 1].user.id,
        getPreviousPageParam: (firstPage) =>
            firstPage.length < QUERY_LIMIT ? undefined : firstPage[firstPage.length - 1].user.id,
        staleTime: Infinity,
        gcTime: Infinity,
        select: useCallback((data: InfiniteData<z.infer<typeof getGuildBansResponseSchema>>) => {
            if (!filter.trim()) {
                return data.pages;
            }
            return data.pages.map((p) =>
                p.filter((gm) => gm.user.displayName.toLowerCase().includes(filter.toLowerCase())),
            );
        }, []),
    });
};
