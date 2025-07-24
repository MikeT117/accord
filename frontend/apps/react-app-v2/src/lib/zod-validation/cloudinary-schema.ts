import * as z from "zod/v4-mini";

export const uploadAttachmentMutationResponseSchema = z.object({
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

export const signAttachmentMutationResponseSchema = z.object({
    id: z.string(),
    signature: z.string(),
    timestamp: z.number(),
});
