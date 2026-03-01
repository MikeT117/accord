import { httpClient } from "@/lib/http-client";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../query-client";
import { toast } from "sonner";

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

export const useDeleteGuildRoleUserMutation = (hookArgs?: MutationHookArgs) =>
    useMutation({
        mutationFn,
        onSuccess: (_, mutationArgs) => {
            queryClient.resetQueries({ queryKey: ["role", mutationArgs.roleId, "members"], exact: false });
            if (typeof hookArgs?.onSuccess === "function") {
                hookArgs.onSuccess();
            }
        },
        onError: () => {
            toast("An error occurred deleting role association, please try again later.");
        },
    });
