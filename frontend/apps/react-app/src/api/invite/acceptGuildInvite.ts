import { AccordApiErrorResponse } from '@accord/common';
import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useAcceptGuildInviteMutation = () => {
  return useMutation<Record<string, never>, AxiosError<AccordApiErrorResponse>, { id: string }>({
    mutationFn: async ({ id }) => {
      return api.post(`/v1/invites/${id}/accept`);
    },
  });
};
