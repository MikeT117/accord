import { httpClient } from "@/lib/http-client";
import { useMutation } from "@tanstack/react-query";

type mutationFnArgsType = {
    roleId: string;
    channelId: string;
    guildId: string;
};

const mutationFn = async ({ channelId, guildId, roleId }: mutationFnArgsType) => {
    return httpClient.delete(`/guilds/${guildId}/roles/${roleId}/channels/${channelId}`);
};

type MutationHookArgs = {
    onSuccess?: () => void;
};

// OnError Will be handled globally with notifications, success will be handled by the component if needed.
export const useDeleteRoleChannelAssoc = (args?: MutationHookArgs) =>
    useMutation({ mutationFn, onSuccess: () => (typeof args?.onSuccess === "function" ? args.onSuccess() : void 0) });
