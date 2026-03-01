import { httpClient } from "@/lib/http-client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

type mutationFnArgsType = {
    id: string;
};

const mutationFn = async ({ id }: mutationFnArgsType) => {
    return httpClient.delete(`/sessions/${id}`);
};

type MutationHookArgs = {
    onSuccess?: () => void;
};

export const useDeleteSessionMutation = (args?: MutationHookArgs) =>
    useMutation({
        mutationFn,
        onSuccess: () => (typeof args?.onSuccess === "function" ? args.onSuccess() : void 0),
        onError: () => {
            toast("An error occurred deleting session, please try again later.");
        },
    });
