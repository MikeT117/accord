import { httpClient } from "@/lib/http-client";
import { tokensSchema } from "@/lib/zod-validation/tokens-schema";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";

type mutationFnArgsType = {
    username: string;
    displayname: string;
    token: string;
};

const mutationFn = async (payload: mutationFnArgsType) => {
    return httpClient.post(`/auth/registration/complete`, payload).then((r) => tokensSchema.parse(r.data));
};

type MutationHookArgs = {
    onSuccess?: () => void;
};

export const useCompleteRegistrationMutation = (args?: MutationHookArgs) => {
    const router = useRouter();

    return useMutation({
        mutationFn,
        onSuccess: (tokens) => router.navigate({ to: "/auth", search: tokens }),
        onError: () => {
            toast("Unable to register user, please try again later.");
        },
    });
};
