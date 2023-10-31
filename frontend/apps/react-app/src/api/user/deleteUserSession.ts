import type { AxiosError } from 'axios';
import { InfiniteData, useMutation } from '@tanstack/react-query';
import type { AccordApiErrorResponse, UserSession } from '@accord/common';
import { api } from '@/lib/axios';
import { queryClient } from '@/lib/queryClient/queryClient';
import { deleteInfiniteDataItem } from '../../lib/queryClient/utils/deleteInfiniteDataItem';

export const useDeleteUserSessionMutation = () => {
  return useMutation<undefined, AxiosError<AccordApiErrorResponse>, Pick<UserSession, 'id'>>({
    mutationFn: async ({ id }) => api.delete(`/v1/users/@me/sessions/${id}`),
    onSuccess: (_, { id }) => {
      queryClient.setQueryData<
        InfiniteData<Pick<UserSession, 'id' | 'createdAt' | 'isCurrentSession'>[]>
      >(['sessions'], (prev) => deleteInfiniteDataItem(prev, (m) => m.id !== id));
    },
  });
};
