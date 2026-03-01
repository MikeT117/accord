import { httpClient } from "@/lib/http-client";
import { guildInviteSchema } from "@/lib/zod-validation/guild-invite-schema";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

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

export const useCreateGuildInviteMutation = (args?: MutationHookArgs) =>
    useMutation({
        mutationFn,
        onSuccess: () => (typeof args?.onSuccess === "function" ? args.onSuccess() : void 0),
        onError: () => {
            toast("An error occurred while creating invite, please try again later.");
        },
    });
