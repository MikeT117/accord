import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

type UploadAttachmentMutationArgs = {
  file: File;
  uploadURL: string;
};

type CloudinaryResponse = {
  access_mode: string;
  api_key: string;
  asset_id: string;
  bytes: number;
  created_at: string;
  etag: string;
  folder: string;
  format: string;
  height: number;
  placeholder: boolean;
  public_id: string;
  resource_type: string;
  secure_url: string;
  signature: string;
  tags: string[];
  type: string;
  url: string;
  version: number;
  version_id: string;
  width: number;
};

export const useUploadAttachmentMutation = () => {
  return useMutation<CloudinaryResponse, AxiosError, UploadAttachmentMutationArgs>({
    mutationFn: async (args) => {
      const formData = new FormData();
      formData.append('file', args.file);

      const resp = await api.post<CloudinaryResponse>(args.uploadURL, formData);
      return resp.data;
    },
  });
};
