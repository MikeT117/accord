import { useGetDiscoverableGuildsQuery } from '@/api/guilds/getDiscoverableGuilds';
import { useSearchQueryParams } from './useSearchQueryParams';

export const useFilterableDiscoverableGuilds = () => {
  const { query, limit } = useSearchQueryParams();
  const { data, isLoading, fetchNextPage } = useGetDiscoverableGuildsQuery(limit, query);
  return { query, isLoading, data, fetchNextPage };
};
