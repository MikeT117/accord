import { Guild, AccordApiErrorResponse } from '@accord/common';
import { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useGetDiscoverableGuildsQuery = ({
  query,
  offset,
  limit,
}: {
  query?: string | null;
  offset: number;
  limit: number;
}) => {
  const queryCheck = typeof query === 'string' && !!query.trim();
  const queryKey = queryCheck
    ? ['guilds', 'discoverable']
    : ['guilds', 'discoverable', 'search', query];

  return useQuery<
    Omit<Guild, 'createdAd' | 'updatedAt' | 'ownerId'>[],
    AxiosError<AccordApiErrorResponse>
  >({
    queryKey,
    queryFn: async () => {
      const { data } = await api.get(
        queryCheck
          ? `/v1/guilds?query=${query}&offset=${offset}&limit=${limit}`
          : `/v1/guilds?offset=${offset}&limit=${limit}`,
      );
      return data;
    },
    staleTime: 30000,
    gcTime: 30000,
  });
};
