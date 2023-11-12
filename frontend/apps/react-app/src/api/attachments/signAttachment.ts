import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { z } from 'zod';

type SignAttachmentMutationArgs = {
  filename: string;
  filesize: number;
  height: number;
  width: number;
  resourceType: string;
};

const signAttachmentMutationResponseSchema = z.object({
  id: z.string(),
  uploadURL: z.string(),
});

const signAttachmentRequest = async (args: SignAttachmentMutationArgs) => {
  const resp = await api.post(`/v1/attachments/sign`, args);
  return signAttachmentMutationResponseSchema.parse(resp.data.data);
};

export const useSignAttachmentMutation = () => {
  return useMutation({
    mutationFn: signAttachmentRequest,
  });
};
