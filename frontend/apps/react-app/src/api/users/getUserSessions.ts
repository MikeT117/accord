import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { z } from 'zod';
import { QUERY_LIMIT } from '../../constants';

const getUserSessionsResponseSchema = z.array(
    z.object({
        id: z.string(),
        isCurrentSession: z.boolean(),
        expiresAt: z.coerce.date(),
    }),
);

const getUserSessionsRequest = async (pageParam: string) => {
    const before = pageParam ? `before=${pageParam}&` : '';
    const resp = await api.get(`/v1/users/@me/sessions?${before}limit=${QUERY_LIMIT}`);
    return getUserSessionsResponseSchema.parse(resp.data.data);
};

export const useInfiniteUserSessionsQuery = () => {
    return useInfiniteQuery({
        queryKey: ['sessions'],
        initialPageParam: '',
        queryFn: ({ pageParam }) => getUserSessionsRequest(pageParam),
        getNextPageParam: (lastPage) =>
            lastPage.length < QUERY_LIMIT ? undefined : lastPage[lastPage.length - 1].id,
        getPreviousPageParam: (firstPage) =>
            firstPage.length < QUERY_LIMIT ? undefined : firstPage[firstPage.length - 1].id,
        staleTime: Infinity,
        gcTime: Infinity,
    });
};
