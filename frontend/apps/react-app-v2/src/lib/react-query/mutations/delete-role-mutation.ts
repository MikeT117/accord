import { httpClient } from "@/lib/http-client";
import { useMutation } from "@tanstack/react-query";

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

// OnError Will be handled globally with notifications, success will be handled by the component if needed.
export const useDeleteGuildRoleMutation = (args?: MutationHookArgs) =>
    useMutation({ mutationFn, onSuccess: () => (typeof args?.onSuccess === "function" ? args.onSuccess() : void 0) });
