import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { queryClient } from '@/lib/queryClient/queryClient';
import { z } from 'zod';
import { UserRelationship } from '../../types';

type CreateUserRelationshipRequestArgs = {
  status: number;
  username: string;
};

const createUserRelationshipResponseSchema = z.object({
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
});

const createUserRelationshipRequest = async (args: CreateUserRelationshipRequestArgs) => {
  const resp = await api.post('/v1/users/@me/relationships', args);
  return createUserRelationshipResponseSchema.parse(resp.data.data);
};

export const useRelationshipCreateMutation = () => {
  return useMutation({
    mutationFn: createUserRelationshipRequest,
    onSuccess: (relationship) => {
      queryClient.setQueryData<UserRelationship[]>(['relationships'], (prev) =>
        Array.isArray(prev) ? [...prev, relationship] : [],
      );
    },
  });
};
