import { AccordApiErrorResponse } from '@accord/common';
import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useSignAttachmentMutation = () => {
  return useMutation<
    { signature: string; timestamp: number; publicId: string },
    AxiosError<AccordApiErrorResponse>,
    { fileName: string }
  >({
    mutationFn: async ({ fileName }) => {
      return (await api.post(`/v1/attachments`, { fileName })).data;
    },
  });
};
