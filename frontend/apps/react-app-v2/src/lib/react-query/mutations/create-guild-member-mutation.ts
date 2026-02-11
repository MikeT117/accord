import { httpClient } from "@/lib/http-client";
import { useMutation } from "@tanstack/react-query";

type mutationFnArgsType = {
    guildId: string;
    inviteId?: string;
};

const mutationFn = async (args: mutationFnArgsType) => {
    return httpClient.post(
        `/guilds/${args.guildId}/members/join`,
        args?.inviteId ? { inviteId: args.inviteId } : undefined,
    );
};

type MutationHookArgs = {
    onSuccess?: () => void;
};

// OnError Will be handled globally with notifications, success will be handled by the component if needed.
export const useCreateGuildMember = (args?: MutationHookArgs) =>
    useMutation({ mutationFn, onSuccess: () => (typeof args?.onSuccess === "function" ? args.onSuccess() : void 0) });
