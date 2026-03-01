import { httpClient } from "@/lib/http-client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

type mutationFnArgsType = {
    id: string;
    guildId: string;
    name: string;
    permissions: number;
};

const mutationFn = async ({ id, guildId, ...payload }: mutationFnArgsType) => {
    return httpClient.patch(`/guilds/${guildId}/roles/${id}`, payload);
};

type MutationHookArgs = {
    onSuccess?: () => void;
};

export const useUpdateGuildRoleMutation = (args?: MutationHookArgs) =>
    useMutation({
        mutationFn,
        onSuccess: () => (typeof args?.onSuccess === "function" ? args.onSuccess() : void 0),
        onError: () => {
            toast("Unable to update role , please try again later.");
        },
    });
