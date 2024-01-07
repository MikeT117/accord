import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { z } from 'zod';
import { QUERY_LIMIT } from '../../constants';

const getChannelMessagesResponseSchema = z.array(
    z.object({
        id: z.string(),
        channelId: z.string(),
        content: z.string(),
        isPinned: z.boolean(),
        flags: z.number(),
        createdAt: z.coerce.date(),
        updatedAt: z.coerce.date().nullable(),
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

const getChannelMessagesRequest = async (channelId: string, pageParam: string) => {
    const resp = await api.get(
        `/v1/channels/${channelId}/messages?${pageParam ?? ''}limit=${QUERY_LIMIT}`,
    );
    return getChannelMessagesResponseSchema.parse(resp.data.data);
};

export const useInfiniteChannelMessagesQuery = (channelId: string) => {
    return useInfiniteQuery({
        maxPages: 4,
        queryKey: [channelId, 'messages'],
        initialPageParam: '',
        queryFn: ({ pageParam }) => getChannelMessagesRequest(channelId, pageParam),
        getNextPageParam: (lastPage) =>
            lastPage.length < QUERY_LIMIT
                ? undefined
                : `before=${lastPage[lastPage.length - 1].id}&`,
        getPreviousPageParam: (firstPage) =>
            firstPage.length < QUERY_LIMIT ? undefined : `after=${firstPage[0].id}&`,
        staleTime: Infinity,
        gcTime: Infinity,
    });
};
