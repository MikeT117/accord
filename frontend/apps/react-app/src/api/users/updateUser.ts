import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { currentUserStore } from '@/shared-stores/currentUserStore';
import { z } from 'zod';

type UpdateUserRequestArgs = {
  avatar?: string;
  displayName: string;
  publicFlags: number;
};

const updateUserResponseSchema = z.object({
  avatar: z.string().nullable().optional(),
  displayName: z.string(),
  publicFlags: z.number(),
});

const updateUserRequest = async (args: UpdateUserRequestArgs) => {
  const resp = await api.patch('/v1/users/@me', args);
  return updateUserResponseSchema.parse(resp.data.data);
};

export const useUpdateUserMutation = () => {
  return useMutation({
    mutationFn: updateUserRequest,
    onSuccess: (user) => currentUserStore.updateUser(user),
  });
};
