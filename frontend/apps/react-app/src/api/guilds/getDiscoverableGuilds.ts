import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { z } from 'zod';
import { QUERY_LIMIT } from '../../constants';

type GetDiscoverableGuildsRequestArgs = {
    pageParam: string;
    query?: string;
    categoryId?: string;
};

const getDiscoverableGuildsSchema = z.array(
    z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        memberCount: z.number(),
        guildCategoryId: z.string().nullable(),
        icon: z.string().nullable(),
        banner: z.string().nullable(),
    }),
);

const getDiscoverableGuildsRequest = async ({
    pageParam,
    query,
    categoryId,
}: GetDiscoverableGuildsRequestArgs) => {
    let endpoint = `/v1/guilds/discoverable?`;

    if (pageParam) {
        endpoint += `before=${pageParam}&`;
    }

    if (typeof categoryId === 'string' && !!categoryId?.trim()) {
        endpoint += `category_id=${categoryId}&`;
    }

    if (typeof query === 'string' && !!query?.trim()) {
        endpoint += `name=${query}&`;
    }

    const resp = await api.get(`${endpoint}limit=${QUERY_LIMIT}`);
    return getDiscoverableGuildsSchema.parse(resp.data.data);
};

export const useInfiniteDiscoverableGuildsQuery = (query?: string, categoryId?: string) => {
    return useInfiniteQuery({
        queryKey: ['guilds', 'discoverable', query, categoryId],
        initialPageParam: '',
        queryFn: ({ pageParam }) => getDiscoverableGuildsRequest({ pageParam, query, categoryId }),
        getNextPageParam: (lastPage) =>
            lastPage.length < QUERY_LIMIT ? undefined : lastPage[lastPage.length - 1].id,
        getPreviousPageParam: (firstPage) =>
            firstPage.length < QUERY_LIMIT ? undefined : firstPage[firstPage.length - 1].id,
        staleTime: 30000,
        gcTime: 30000,
    });
};
