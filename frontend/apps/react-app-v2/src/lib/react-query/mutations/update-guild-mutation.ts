import { httpClient } from "@/lib/http-client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

type mutationFnArgsType = {
    id: string;
    name: string;
    guildCategoryId?: string | null;
    description: string;
    discoverable: boolean;
    iconId?: string | null;
    bannerId?: string | null;
};

const mutationFn = async ({ id, guildCategoryId, iconId, bannerId, ...payload }: mutationFnArgsType) => {
    return httpClient.patch(`/guilds/${id}`, {
        ...payload,
        iconId: typeof iconId === "string" && iconId.length ? iconId : null,
        bannerId: typeof bannerId === "string" && bannerId.length ? bannerId : null,
        guildCategoryId: typeof guildCategoryId === "string" && guildCategoryId.length ? guildCategoryId : null,
    });
};

type MutationHookArgs = {
    onSuccess?: () => void;
};

export const useUpdateGuildMutation = (args?: MutationHookArgs) =>
    useMutation({
        mutationFn,
        onSuccess: () => (typeof args?.onSuccess === "function" ? args.onSuccess() : void 0),
        onError: () => {
            toast("Unable to update guild, please try again later.");
        },
    });
