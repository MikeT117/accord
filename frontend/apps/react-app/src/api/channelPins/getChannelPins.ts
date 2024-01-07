import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { z } from 'zod';
import { QUERY_LIMIT } from '../../constants';

const getChannelPinsResponseSchema = z.array(
    z.object({
        id: z.string(),
        channelId: z.string(),
        content: z.string(),
        isPinned: z.boolean(),
        flags: z.number(),
        createdAt: z.coerce.date(),
        updatedAt: z.coerce.date(),
        author: z.object({
            id: z.string(),
            avatar: z.string().nullable(),
            displayName: z.string(),
            username: z.string(),
            publicFlags: z.number(),
        }),
        attachments: z.array(z.string()),
    }),
);

const getChannelPinsRequest = async (channelId: string, pageParam: string) => {
    const before = pageParam ? `before=${pageParam}&` : '';
    const resp = await api.get(`/v1/channels/${channelId}/pins?${before}limit=${QUERY_LIMIT}`);
    return getChannelPinsResponseSchema.parse(resp.data.data);
};

export const useInfiniteChannelPinsQuery = (channelId: string) => {
    return useInfiniteQuery({
        queryKey: [channelId, 'pins'],
        initialPageParam: '',
        queryFn: ({ pageParam }) => getChannelPinsRequest(channelId, pageParam),
        getNextPageParam: (lastPage) =>
            lastPage.length < QUERY_LIMIT ? undefined : lastPage[lastPage.length - 1].id,
        getPreviousPageParam: (firstPage) =>
            firstPage.length < QUERY_LIMIT ? undefined : firstPage[firstPage.length - 1].id,
        staleTime: Infinity,
        gcTime: Infinity,
    });
};
