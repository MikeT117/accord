import { httpClient } from "@/lib/http-client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

type mutationFnArgsType = {
    id: string;
    displayName: string;
    publicFlags: number;
    avatarId?: string | null;
    bannerId?: string | null;
};

const mutationFn = async ({ id, ...payload }: mutationFnArgsType) => {
    return httpClient.patch(`/users/${id}`, payload);
};

type MutationHookArgs = {
    onSuccess?: () => void;
};

export const useUpdateUserMutation = (args?: MutationHookArgs) =>
    useMutation({
        mutationFn,
        onSuccess: () => (typeof args?.onSuccess === "function" ? args.onSuccess() : void 0),
        onError: () => {
            toast("Unable to update user, please try again later.");
        },
    });
