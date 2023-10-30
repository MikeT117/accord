import { AccordApiErrorResponse, UserRelationship } from '@accord/common';
import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { queryClient } from '@/lib/queryClient/queryClient';

export const useDeleteRelationshipMutation = () => {
  return useMutation<
    Record<string, never>,
    AxiosError<AccordApiErrorResponse>,
    Pick<UserRelationship, 'id' | 'status'>
  >(
    async ({ id }) => {
      return api.delete(`/v1/users/@me/relationships/${id}`);
    },
    {
      onSuccess: (_, { id, status }) => {
        if (status === 0) {
          queryClient.setQueryData<UserRelationship[]>(['relationships', 0], (prev) =>
            Array.isArray(prev) ? prev.filter((r) => r.id !== id) : [],
          );
        }
        if (status === 1) {
          queryClient.setQueryData<UserRelationship[]>(['relationships', 1], (prev) =>
            Array.isArray(prev) ? prev.filter((r) => r.id !== id) : [],
          );
        }
        if (status === 2) {
          queryClient.setQueryData<UserRelationship[]>(['relationships', 2], (prev) =>
            Array.isArray(prev) ? prev.filter((r) => r.id !== id) : [],
          );
        }
      },
    },
  );
};
