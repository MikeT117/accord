import { httpClient } from "@/lib/http-client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

type DeleteGuildInviteMutationArgs = {
    guildId: string;
    inviteId: string;
};

const mutationFn = async (args: DeleteGuildInviteMutationArgs) => {
    return httpClient.delete(`/guilds/${args.guildId}/invites/${args.inviteId}`);
};

type MutationHookArgs = {
    onSuccess?: () => void;
};

export const useDeleteGuildInviteMutation = (args?: MutationHookArgs) =>
    useMutation({
        mutationFn,
        onSuccess: () => (typeof args?.onSuccess === "function" ? args.onSuccess() : void 0),
        onError: () => {
            toast("An error occurred deleting guild invite, please try again later.");
        },
    });
