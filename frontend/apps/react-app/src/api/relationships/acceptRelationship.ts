import { UserRelationship, AccordApiErrorResponse } from '@accord/common';
import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { queryClient } from '@/lib/queryClient/queryClient';

export const useAcceptRelationshipMutation = () => {
  return useMutation<
    UserRelationship,
    AxiosError<AccordApiErrorResponse>,
    Pick<UserRelationship, 'id' | 'status'>
  >(
    async ({ id }) => {
      const { data } = await api.patch(`/v1/users/@me/relationships/${id}/accept`);
      return data.relationship;
    },
    {
      onSuccess: (relationship) => {
        queryClient.setQueryData<UserRelationship[]>(['relationships', 1], (prev) =>
          Array.isArray(prev) ? prev.filter((r) => r.id !== relationship.id) : [],
        );
        queryClient.setQueryData<UserRelationship[]>(['relationships', 0], (prev) =>
          Array.isArray(prev) ? [...prev, relationship] : [relationship],
        );
      },
    },
  );
};
