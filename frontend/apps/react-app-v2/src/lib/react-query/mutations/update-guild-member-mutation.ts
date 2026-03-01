import { httpClient } from "@/lib/http-client";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../query-client";
import { toast } from "sonner";

type mutationFnArgsType = {
    id: string;
    guildId: string;
    nickname: string;
    iconId?: string | null;
    bannerId?: string | null;
};

const mutationFn = async ({ id, guildId, iconId, bannerId, ...payload }: mutationFnArgsType) => {
    return httpClient.patch(`/guilds/${guildId}/members/${id}`, {
        ...payload,
        iconId: typeof iconId === "string" && iconId.length ? iconId : null,
        bannerId: typeof bannerId === "string" && bannerId.length ? bannerId : null,
    });
};

type MutationHookArgs = {
    onSuccess?: () => void;
};

export const useUpdateGuildMemberMutation = (args?: MutationHookArgs) =>
    useMutation({
        mutationFn,
        onSuccess: (_, vars) => {
            queryClient.invalidateQueries({
                queryKey: ["guild", vars.guildId, "members", vars.id],
            });
        },
        onError: () => {
            toast("Unable to update guild member , please try again later.");
        },
    });
