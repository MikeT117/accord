import { httpClient } from "@/lib/http-client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

type mutationFnArgsType = {
    id: string;
    guildId: string;
};

const mutationFn = async ({ id, guildId }: mutationFnArgsType) => {
    return httpClient.delete(`/guilds/${guildId}/roles/${id}`);
};

type MutationHookArgs = {
    onSuccess?: () => void;
};

export const useDeleteGuildRoleMutation = (args?: MutationHookArgs) =>
    useMutation({
        mutationFn,
        onSuccess: () => (typeof args?.onSuccess === "function" ? args.onSuccess() : void 0),
        onError: () => {
            toast("An error occurred deleting role, please try again later.");
        },
    });
