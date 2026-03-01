import { httpClient } from "@/lib/http-client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

type mutationFnArgsType = {
    guildId: string;
    inviteId?: string;
};

const mutationFn = async (args: mutationFnArgsType) => {
    return httpClient.post(`/guilds/${args.guildId}/members`, args?.inviteId ? { inviteId: args.inviteId } : undefined);
};

type MutationHookArgs = {
    onSuccess?: () => void;
};

export const useCreateGuildMember = (args?: MutationHookArgs) =>
    useMutation({
        mutationFn,
        onSuccess: () => (typeof args?.onSuccess === "function" ? args.onSuccess() : void 0),
        onError: () => {
            toast("An error occurred while creating member, please try again later.");
        },
    });
