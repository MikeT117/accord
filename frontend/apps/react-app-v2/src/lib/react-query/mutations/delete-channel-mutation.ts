import { httpClient } from "@/lib/http-client";
import { useMutation } from "@tanstack/react-query";

type DeleteChannelMutationArgs = {
    id: string;
};

const deleteChannelRequest = async (args: DeleteChannelMutationArgs) => {
    return httpClient.delete(`/channels/${args.id}`);
};

type MutationHookArgs = {
    onSuccess?: () => void;
};

// OnError Will be handled globally with notifications, success will be handled by the component if needed.
export const useDeleteChannelMutation = (args: MutationHookArgs) =>
    useMutation({
        mutationFn: deleteChannelRequest,
        onSuccess: () => (typeof args?.onSuccess === "function" ? args.onSuccess() : void 0),
    });
