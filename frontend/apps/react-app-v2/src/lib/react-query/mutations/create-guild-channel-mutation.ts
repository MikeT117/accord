import { httpClient } from "@/lib/http-client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

type mutationFnArgsType = {
    name: string;
    channelType: number;
    roleIds: string[];
    guildId: string;
};

const mutationFn = async (payload: mutationFnArgsType) => {
    return httpClient.post(`/channels`, payload);
};

type MutationHookArgs = {
    onSuccess?: () => void;
};

export const useCreateGuildChannelMutation = (args?: MutationHookArgs) =>
    useMutation({
        mutationFn,
        onSuccess: () => (typeof args?.onSuccess === "function" ? args.onSuccess() : void 0),
        onError: () => {
            toast("An error occurred while creating channel, please try again later.");
        },
    });
