import { httpClient } from "@/lib/http-client";
import { useMutation } from "@tanstack/react-query";

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

// OnError Will be handled globally with notifications, success will be handled by the component if needed.
export const useUpdateGuildRoleMutation = (args?: MutationHookArgs) =>
    useMutation({ mutationFn, onSuccess: () => (typeof args?.onSuccess === "function" ? args.onSuccess() : void 0) });
