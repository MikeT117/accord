import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { queryClient } from '@/lib/queryClient/queryClient';
import { UserRelationship } from '../../types';

const deleteRelationshipRequest = async (id: string) => {
  return api.delete(`/v1/users/@me/relationships/${id}`);
};

export const useDeleteRelationshipMutation = () => {
  return useMutation({
    mutationFn: deleteRelationshipRequest,
    onSuccess: (_, id) => {
      queryClient.setQueryData<UserRelationship[]>(['relationships'], (prev) =>
        Array.isArray(prev) ? prev.filter((r) => r.id !== id) : [],
      );
    },
  });
};
