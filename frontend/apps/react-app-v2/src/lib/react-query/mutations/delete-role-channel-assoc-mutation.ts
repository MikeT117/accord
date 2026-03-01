import { httpClient } from "@/lib/http-client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

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

export const useDeleteRoleChannelAssoc = (args?: MutationHookArgs) =>
    useMutation({
        mutationFn,
        onSuccess: () => (typeof args?.onSuccess === "function" ? args.onSuccess() : void 0),
        onError: () => {
            toast("An error occurred deleting role association, please try again later.");
        },
    });
