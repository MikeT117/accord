import { httpClient } from "@/lib/http-client";
import { signAttachmentMutationResponseSchema } from "@/lib/zod-validation/cloudinary-schema";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

type SignAttachmentMutationArgs = {
    filename: string;
    resourceType: string;
    filesize: number;
};

const signAttachmentRequest = async (args: SignAttachmentMutationArgs) => {
    const resp = await httpClient.post(`/attachments`, args);
    return signAttachmentMutationResponseSchema.parse(resp.data);
};

export const useSignAttachmentMutation = () =>
    useMutation({
        mutationFn: signAttachmentRequest,
        onError: () => {
            toast("Unable to sign attachment, please try again later.");
        },
    });
