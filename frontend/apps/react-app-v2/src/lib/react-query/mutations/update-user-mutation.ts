import { httpClient } from "@/lib/http-client";
import { useMutation } from "@tanstack/react-query";

type mutationFnArgsType = {
    displayName: string;
    publicFlags: number;
    avatarId?: string | null;
    bannerId?: string | null;
};

const mutationFn = async (payload: mutationFnArgsType) => {
    return httpClient.patch("/users/me", payload);
};

type MutationHookArgs = {
    onSuccess?: () => void;
};

// OnError Will be handled globally with notifications, success will be handled by the component if needed.
export const useUpdateUserMutation = (args?: MutationHookArgs) =>
    useMutation({ mutationFn, onSuccess: () => (typeof args?.onSuccess === "function" ? args.onSuccess() : void 0) });
