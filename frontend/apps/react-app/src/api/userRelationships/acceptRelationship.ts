import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { queryClient } from '@/lib/queryClient/queryClient';
import { UserRelationship } from '../../types';

const updateUserRelationshipRequest = async (id: string) => {
  return api.patch(`/v1/users/@me/relationships/${id}/accept`);
};

export const useAcceptRelationshipMutation = () => {
  return useMutation({
    mutationFn: updateUserRelationshipRequest,
    onSuccess: (_, id) => {
      queryClient.setQueryData<UserRelationship[]>(['relationships'], (prev) =>
        Array.isArray(prev) ? prev.map((r) => (r.id === id ? { ...r, status: 0 } : r)) : undefined,
      );
    },
  });
};
