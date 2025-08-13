import { httpClient } from "@/lib/http-client";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../query-client";

type mutationFnArgsType = {
    roleId: string;
    guildId: string;
    userId: string;
};

const mutationFn = async ({ roleId, guildId, userId }: mutationFnArgsType) => {
    return httpClient.delete(`/guilds/${guildId}/roles/${roleId}/users/${userId}`);
};

type MutationHookArgs = {
    onSuccess?: () => void;
};

// OnError Will be handled globally with notifications, success will be handled by the component if needed.
export const useDeleteGuildRoleUserMutation = (hookArgs?: MutationHookArgs) =>
    useMutation({
        mutationFn,
        onSuccess: (_, mutationArgs) => {
            queryClient.resetQueries({ queryKey: ["role", mutationArgs.roleId, "members"], exact: false });
            if (typeof hookArgs?.onSuccess === "function") {
                hookArgs.onSuccess();
            }
        },
    });
