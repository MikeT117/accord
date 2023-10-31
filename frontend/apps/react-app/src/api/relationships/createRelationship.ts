import { UserRelationship, UserAccount, AccordApiErrorResponse } from '@accord/common';
import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { queryClient } from '@/lib/queryClient/queryClient';

export const useRelationshipCreateMutation = () => {
  return useMutation<
    UserRelationship,
    AxiosError<AccordApiErrorResponse>,
    Pick<UserRelationship, 'status'> & Pick<UserAccount, 'displayName'>
  >({
    mutationFn: async ({ displayName }) => {
      const { data } = await api.post('/v1/users/@me/relationships/', {
        status,
        displayName,
      });
      return data.relationship;
    },
    onSuccess: (relationship) => {
      queryClient.setQueryData<UserRelationship[]>(['relationships'], (prev) =>
        Array.isArray(prev) ? [...prev, relationship] : [],
      );
    },
  });
};
