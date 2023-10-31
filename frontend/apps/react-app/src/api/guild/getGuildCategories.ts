import { GuildCategory, AccordApiErrorResponse } from '@accord/common';
import { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { APIResponse, api } from '@/lib/axios';

export const useGetGuildCategoriesQuery = () => {
  return useQuery<APIResponse<GuildCategory[]>, AxiosError<AccordApiErrorResponse>>({
    queryKey: ['guild-categories'],
    queryFn: async () => {
      const { data } = await api.get<APIResponse<GuildCategory[]>>('/v1/guilds/categories');
      return data;
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });
};
