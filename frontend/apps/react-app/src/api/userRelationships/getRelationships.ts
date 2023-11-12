import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { z } from 'zod';

const getUserRelationshipsResponseSchema = z.array(
  z.object({
    id: z.string(),
    creatorId: z.string(),
    status: z.number(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    user: z.object({
      id: z.string(),
      avatar: z.string().nullable(),
      displayName: z.string(),
      username: z.string(),
      publicFlags: z.number(),
    }),
  }),
);

const getUserRelationshipsRequest = async () => {
  const resp = await api.get(`/v1/users/@me/relationships`);
  return getUserRelationshipsResponseSchema.parse(resp.data.data);
};

export const useGetRelationshipsQuery = () => {
  return useQuery({
    queryKey: ['relationships'],
    queryFn: getUserRelationshipsRequest,
    staleTime: Infinity,
    gcTime: Infinity,
  });
};
