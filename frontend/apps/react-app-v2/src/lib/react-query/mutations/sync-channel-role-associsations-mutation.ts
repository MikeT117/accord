import { httpClient } from "@/lib/http-client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

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

export const useSyncChannelRoleAssociationsMutation = (args?: MutationHookArgs) =>
    useMutation({
        mutationFn,
        onSuccess: () => (typeof args?.onSuccess === "function" ? args.onSuccess() : void 0),
        onError: () => {
            toast("Unable to sync channel permissions with parent, please try again later.");
        },
    });
