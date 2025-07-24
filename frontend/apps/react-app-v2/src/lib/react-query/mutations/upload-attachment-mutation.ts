import { env } from "@/lib/constants";
import { httpClient } from "@/lib/http-client";
import { uploadAttachmentMutationResponseSchema } from "@/lib/zod-validation/cloudinary-schema";
import { useMutation } from "@tanstack/react-query";

type UploadAttachmentMutationArgs = {
    id: string;
    file: File;
    signature: string;
    timestamp: number;
};

function createUploadURL(args: UploadAttachmentMutationArgs) {
    return `https://api.cloudinary.com/v1_1/${"dm3guxnpr"}/auto/upload?api_key=${env.CLOUDINARY_API_KEY}&signature=${args.signature}&timestamp=${args.timestamp}&public_id=${args.id}`;
}

const uploadAttachmentRequest = async (args: UploadAttachmentMutationArgs) => {
    const formData = new FormData();
    formData.append("file", args.file);
    const resp = await httpClient.post(createUploadURL(args), formData);
    return uploadAttachmentMutationResponseSchema.parse(resp.data);
};

export const useUploadAttachmentMutation = () => useMutation({ mutationFn: uploadAttachmentRequest });
