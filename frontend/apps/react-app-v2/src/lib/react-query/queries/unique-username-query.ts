import { httpClient } from "@/lib/http-client";
import { uniqueUsernameSchema } from "@/lib/zod-validation/unique-username-schema";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

type UsernameUniqueQueryArgs = {
    username: string;
    token: string;
};

const mutationFn = async (payload: UsernameUniqueQueryArgs) => {
    return httpClient
        .post(`/auth/registration/username-unique`, payload)
        .then((r) => uniqueUsernameSchema.parse(r.data));
};

type MutationHookArgs = {
    onSuccess?: () => void;
};

export const useUniqueUsernameCheck = (args?: MutationHookArgs) =>
    useMutation({
        mutationFn,
        onSuccess: () => (typeof args?.onSuccess === "function" ? args.onSuccess() : void 0),
        onError: () => {
            toast("Unable to validate username, please try again later.");
        },
    });
