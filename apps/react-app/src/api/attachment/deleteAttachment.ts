import { AccordApiErrorResponse } from '@accord/common';
import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useDeleteAttachmentMutation = () => {
  return useMutation<
    Record<string, unknown>,
    AxiosError<AccordApiErrorResponse>,
    { publicId: string; resourceType: string; signature: string; timestamp: number }
  >(async ({ publicId, resourceType, signature, timestamp }) => {
    const { data } = await api.post(`/v1/attachments/destroy`, {
      publicId,
      resourceType,
      signature,
      timestamp,
    });

    return data;
  });
};
