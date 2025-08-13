import { httpClient } from "@/lib/http-client";
import { useMutation } from "@tanstack/react-query";

type mutationFnArgsType = {
    id: string;
    name: string;
    guildCategoryID?: string | null;
    description: string;
    discoverable: boolean;
    iconID?: string | null;
    bannerID?: string | null;
};

const mutationFn = async ({ id, ...payload }: mutationFnArgsType) => {
    return httpClient.patch(`/guilds/${id}`, payload);
};

type MutationHookArgs = {
    onSuccess?: () => void;
};

// OnError Will be handled globally with notifications, success will be handled by the component if needed.
export const useUpdateGuildMutation = (args?: MutationHookArgs) =>
    useMutation({ mutationFn, onSuccess: () => (typeof args?.onSuccess === "function" ? args.onSuccess() : void 0) });
