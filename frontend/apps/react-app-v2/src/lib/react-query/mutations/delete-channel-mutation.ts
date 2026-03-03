import { httpClient } from "@/lib/http-client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

type DeleteChannelMutationArgs = {
    id: string;
};

const deleteChannelRequest = async (args: DeleteChannelMutationArgs) => {
    return httpClient.delete(`/channels/${args.id}`);
};

type MutationHookArgs = {
    onSuccess?: () => void;
};

export const useDeleteChannelMutation = (args?: MutationHookArgs) =>
    useMutation({
        mutationFn: deleteChannelRequest,
        onSuccess: () => (typeof args?.onSuccess === "function" ? args.onSuccess() : void 0),
        onError: () => {
            toast("An error occurred deleting channel, please try again later.");
        },
    });
