import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { api } from '../../lib/axios';

const getGuildCategoriesResponseSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    createdAt: z.coerce.date(),
  }),
);

const getGuildCategoriesRequest = async () => {
  const resp = await api.get(`/v1/guilds/categories`);
  return getGuildCategoriesResponseSchema.parse(resp.data.data);
};

export const useGetGuildCategoriesQuery = () => {
  return useQuery({
    queryKey: ['guild-categories'],
    queryFn: () => getGuildCategoriesRequest(),
    staleTime: Infinity,
    gcTime: Infinity,
  });
};
