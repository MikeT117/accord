import { httpClient } from "@/lib/http-client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

type mutationFnArgsType = {
    id: string;
    parentId?: string | null;
    name: string;
    topic?: string;
};

const mutationFn = async ({ id, ...payload }: mutationFnArgsType) => {
    return httpClient.patch(`/channels/${id}`, {
        ...payload,
        parentId: typeof payload.parentId === "string" && payload.parentId.length ? payload.parentId : null,
    });
};

type MutationHookArgs = {
    onSuccess?: () => void;
};

export const useUpdateGuildChannelMutation = (args?: MutationHookArgs) =>
    useMutation({
        mutationFn,
        onSuccess: () => (typeof args?.onSuccess === "function" ? args.onSuccess() : void 0),
        onError: () => {
            toast("Unable to update channel, please try again later.");
        },
    });
