import type { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import type { AccordApiErrorResponse } from '@accord/common';
import { api } from '@/lib/axios';
import { sessionStore } from '@/shared-stores/sessionStore';

export const useDeleteAccountMutation = () => {
  return useMutation<unknown, AxiosError<AccordApiErrorResponse>, unknown>(
    async () => api.delete('/v1/users/@me'),
    {
      onSuccess: () => {
        sessionStore.clearSession();
      },
    },
  );
};
