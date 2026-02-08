import { httpClient } from "@/lib/http-client";
import { guildInviteSchema } from "@/lib/zod-validation/guild-invite-schema";
import { useMutation } from "@tanstack/react-query";

type mutationFnArgsType = {
    guildId: string;
    expiresAt: Date;
};

const mutationFn = async ({ guildId, expiresAt }: mutationFnArgsType) => {
    return httpClient.post(`/guilds/${guildId}/invites`, { expiresAt }).then((r) => {
        return guildInviteSchema.parse(r.data);
    });
};

type MutationHookArgs = {
    onSuccess?: () => void;
};

// OnError Will be handled globally with notifications, success will be handled by the component if needed.
export const useCreateGuildInviteMutation = (args?: MutationHookArgs) =>
    useMutation({ mutationFn, onSuccess: () => (typeof args?.onSuccess === "function" ? args.onSuccess() : void 0) });
