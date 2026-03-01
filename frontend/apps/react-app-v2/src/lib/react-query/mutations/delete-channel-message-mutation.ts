import { httpClient } from "@/lib/http-client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

type DeleteChannelMutationArgs = {
    id: string;
    channelId: string;
};

const mutationFn = async (args: DeleteChannelMutationArgs) => {
    return httpClient.delete(`/channels/${args.channelId}/messages/${args.id}`);
};

type MutationHookArgs = {
    onSuccess?: () => void;
};

export const useDeleteChannelMessageMutation = (args?: MutationHookArgs) =>
    useMutation({
        mutationFn,
        onSuccess: () => (typeof args?.onSuccess === "function" ? args.onSuccess() : void 0),
        onError: () => {
            toast("An error occurred while deleting message, please try again later.");
        },
    });
