import { useInfiniteDiscoverableGuildsQuery } from '@/api/guilds/getDiscoverableGuilds';
import { useSearchQueryParams } from './useSearchQueryParams';

export const useFilterableDiscoverableGuilds = (categoryId?: string) => {
    const { query } = useSearchQueryParams();
    const { data, isLoading, fetchNextPage, hasNextPage } = useInfiniteDiscoverableGuildsQuery(
        query,
        categoryId,
    );
    return { query, isLoading, data, fetchNextPage, hasNextPage };
};
