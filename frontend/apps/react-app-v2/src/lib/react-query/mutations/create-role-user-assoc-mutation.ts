import { httpClient } from "@/lib/http-client";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../query-client";

type mutationFnArgsType = {
    roleId: string;
    guildId: string;
    userIds: string[];
};

const mutationFn = async ({ userIds, guildId, roleId }: mutationFnArgsType) => {
    return httpClient.patch(`/guilds/${guildId}/roles/${roleId}/users`, { userIds });
};

type MutationHookArgs = {
    onSuccess?: () => void;
};

// OnError Will be handled globally with notifications, success will be handled by the component if needed.
export const useCreateRoleUserAssocMutation = (hookArgs?: MutationHookArgs) =>
    useMutation({
        mutationFn,
        onSuccess: (_, mutationArgs) => {
            queryClient.resetQueries({ queryKey: ["role", mutationArgs.roleId, "members"], exact: false });
            if (typeof hookArgs?.onSuccess === "function") {
                hookArgs.onSuccess();
            }
        },
    });
