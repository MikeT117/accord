import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { z } from 'zod';

type UploadAttachmentMutationArgs = {
    file: File;
    uploadURL: string;
};

const uploadAttachmentResponseSchema = z.object({
    access_mode: z.string(),
    api_key: z.string(),
    asset_id: z.string(),
    bytes: z.number(),
    created_at: z.string(),
    etag: z.string(),
    folder: z.string(),
    format: z.string(),
    height: z.number(),
    placeholder: z.boolean(),
    public_id: z.string(),
    resource_type: z.string(),
    secure_url: z.string(),
    signature: z.string(),
    tags: z.array(z.string()),
    type: z.string(),
    url: z.string(),
    version: z.number(),
    version_id: z.string(),
    width: z.number(),
});

const uploadAttachmentRequest = async (args: UploadAttachmentMutationArgs) => {
    const formData = new FormData();
    formData.append('file', args.file);
    const resp = await api.post(args.uploadURL, formData);
    return uploadAttachmentResponseSchema.parse(resp.data);
};

export const useUploadAttachmentMutation = () => {
    return useMutation({
        mutationFn: uploadAttachmentRequest,
    });
};
