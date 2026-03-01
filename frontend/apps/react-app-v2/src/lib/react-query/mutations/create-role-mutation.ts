import { httpClient } from "@/lib/http-client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

type mutationFnArgsType = {
    guildId: string;
};

const mutationFn = async ({ guildId }: mutationFnArgsType) => {
    return httpClient.post(`/guilds/${guildId}/roles`);
};

type MutationHookArgs = {
    onSuccess?: () => void;
};

export const useCreateGuildRoleMutation = (args?: MutationHookArgs) =>
    useMutation({
        mutationFn,
        onSuccess: () => (typeof args?.onSuccess === "function" ? args.onSuccess() : void 0),
        onError: () => {
            toast("An error occurred while creating role, please try again later.");
        },
    });
