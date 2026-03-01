import { httpClient } from "@/lib/http-client";
import type { ChannelMessageType } from "@/lib/types/types";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

type mutationFnArgsType = ChannelMessageType;

const mutationFn = async (message: mutationFnArgsType) => {
    return httpClient.patch(`/channels/${message.channelId}/messages/${message.id}`, message);
};

type MutationHookArgs = {
    onSuccess?: () => void;
};

export const useUpdateChannelMessageMutation = (args?: MutationHookArgs) =>
    useMutation({
        mutationFn,
        onSuccess: () => (typeof args?.onSuccess === "function" ? args.onSuccess() : void 0),
        onError: () => {
            toast("An error occurred while updating message, please try again later.");
        },
    });
