import { InfiniteData, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { queryClient } from '@/lib/queryClient/queryClient';
import { deleteInfiniteDataItem } from '../../lib/queryClient/utils/deleteInfiniteDataItem';
import { UserSessionLimited } from '../../types';

const deleteUserSessionRequest = (id: string) => {
  return api.delete(`/v1/users/@me/sessions/${id}`);
};

export const useDeleteUserSessionMutation = () => {
  return useMutation({
    mutationFn: deleteUserSessionRequest,
    onSuccess: (_, id) => {
      queryClient.setQueryData<InfiniteData<UserSessionLimited[]>>(['sessions'], (prev) =>
        deleteInfiniteDataItem(prev, (m) => m.id !== id),
      );
    },
  });
};
