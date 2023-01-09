import { GuildCategory, AccordApiErrorResponse } from '@accord/common';
import { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useGetGuildCategoriesQuery = () => {
  return useQuery<GuildCategory[], AxiosError<AccordApiErrorResponse>>(
    ['guild-categories'],
    async () => {
      const { data } = await api.get('/v1/guilds/categories');
      return data;
    },
    {
      staleTime: Infinity,
      cacheTime: Infinity,
    },
  );
};
