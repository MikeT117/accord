import { httpClient } from "@/lib/http-client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "../query-client";

type mutationFnArgsType = {
    id: string;
    channelId: string;
};

const mutationFn = async (message: mutationFnArgsType) => {
    return httpClient.put(`/channels/${message.channelId}/pins/messages/${message.id}`);
};

type MutationHookArgs = {
    onSuccess?: () => void;
};

// OnError Will be handled globally with notifications, success will be handled by the component if needed.
export const useCreateChannelPinMutation = (hookArgs?: MutationHookArgs) =>
    useMutation({
        mutationFn,
        onSuccess: (_, mutationArgs) => {
            queryClient.resetQueries({
                queryKey: ["channel", mutationArgs.channelId, "messages", "pinned", true],
                exact: false,
            });
            if (typeof hookArgs?.onSuccess === "function") {
                hookArgs.onSuccess();
            }
        },
        onError: () => {
            toast("An error occurred while pinning message, please try again later.");
        },
    });
