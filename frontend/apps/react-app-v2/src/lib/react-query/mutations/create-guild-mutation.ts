import { httpClient } from "@/lib/http-client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

type mutationFnArgsType = {
    name: string;
    iconId?: string;
};

const mutationFn = async (payload: mutationFnArgsType) => {
    return httpClient.post(`/guilds`, payload);
};

type MutationHookArgs = {
    onSuccess?: () => void;
};

export const useCreateGuildMutation = (args?: MutationHookArgs) =>
    useMutation({
        mutationFn,
        onSuccess: () => (typeof args?.onSuccess === "function" ? args.onSuccess() : void 0),
        onError: () => {
            toast("An error occurred while creating guild, please try again later.");
        },
    });
