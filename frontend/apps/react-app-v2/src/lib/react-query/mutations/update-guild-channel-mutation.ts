import { httpClient } from "@/lib/http-client";
import { useMutation } from "@tanstack/react-query";

type mutationFnArgsType = {
    id: string;
    parentId?: string | null;
    name: string;
    topic?: string;
};

const mutationFn = async ({ id, ...payload }: mutationFnArgsType) => {
    return httpClient.patch(`/channels/${id}`, payload);
};

type MutationHookArgs = {
    onSuccess?: () => void;
};

// OnError Will be handled globally with notifications, success will be handled by the component if needed.
export const useUpdateGuildChannelMutation = (args?: MutationHookArgs) =>
    useMutation({ mutationFn, onSuccess: () => (typeof args?.onSuccess === "function" ? args.onSuccess() : void 0) });
