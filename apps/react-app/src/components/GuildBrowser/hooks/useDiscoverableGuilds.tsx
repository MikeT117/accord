import { useEffect } from 'react';
import { useGetDiscoverableGuildsQuery } from '@/api/guild/getDiscoverableGuilds';
import { useSearchQueryParams } from './useSearchQueryParams';

export const useFilterableDiscoverableGuilds = () => {
  const { limit, offset, query } = useSearchQueryParams();
  const _offset = (typeof offset === 'string' ? parseInt(offset, 10) : 0) ?? 0;
  const _limit = (typeof limit === 'string' ? parseInt(limit, 10) : 10) ?? 10;
  const { data, isLoading, refetch } = useGetDiscoverableGuildsQuery({
    query,
    offset: _offset,
    limit: _limit,
  });

  useEffect(() => {
    refetch();
  }, [query, refetch]);

  return { query, isLoading, discoverableGuilds: data ?? [] };
};
