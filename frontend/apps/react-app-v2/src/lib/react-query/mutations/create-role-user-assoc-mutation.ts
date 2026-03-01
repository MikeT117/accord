import { httpClient } from "@/lib/http-client";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../query-client";
import { toast } from "sonner";

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

export const useCreateRoleUserAssocMutation = (hookArgs?: MutationHookArgs) =>
    useMutation({
        mutationFn,
        onSuccess: (_, mutationArgs) => {
            queryClient.resetQueries({ queryKey: ["role", mutationArgs.roleId, "members"], exact: false });
            if (typeof hookArgs?.onSuccess === "function") {
                hookArgs.onSuccess();
            }
        },
        onError: () => {
            toast("An error occurred while associating role, please try again later.");
        },
    });
