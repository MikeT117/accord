import { httpClient } from "@/lib/http-client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

type mutationFnArgsType = {
    channelId: string;
    content?: string;
    attachmentIds?: string[];
};

const mutationFn = async ({ content, channelId, attachmentIds }: mutationFnArgsType) => {
    return httpClient.post(`/channels/${channelId}/messages`, {
        content,
        attachmentIds,
    });
};

type MutationHookArgs = {
    onSuccess?: () => void;
};

// OnError Will be handled globally with notifications, success will be handled by the component if needed.
export const useCreateChannelMessageMutation = (args?: MutationHookArgs) =>
    useMutation({
        mutationFn,
        onSuccess: () => (typeof args?.onSuccess === "function" ? args.onSuccess() : void 0),
        onError: () => {
            toast("An error occurred while sending message, please try again later.");
        },
    });
