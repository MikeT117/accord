import { httpClient } from "@/lib/http-client";
import { useMutation } from "@tanstack/react-query";

type mutationFnArgsType = {
    sourceChannelId: string;
    targetChannelId: string;
    guildId: string;
};

const mutationFn = async ({ guildId, sourceChannelId, targetChannelId }: mutationFnArgsType) => {
    return httpClient.post(`/guilds/${guildId}/roles/sync/${sourceChannelId}/${targetChannelId}`);
};

type MutationHookArgs = {
    onSuccess?: () => void;
};

// OnError Will be handled globally with notifications, success will be handled by the component if needed.
export const useSyncChannelRoleAssociationsMutation = (args?: MutationHookArgs) =>
    useMutation({ mutationFn, onSuccess: () => (typeof args?.onSuccess === "function" ? args.onSuccess() : void 0) });
