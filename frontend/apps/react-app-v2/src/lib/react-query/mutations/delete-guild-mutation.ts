import { httpClient } from "@/lib/http-client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

type DeleteGuildMutationArgs = {
    id: string;
};

const mutationFn = async (args: DeleteGuildMutationArgs) => {
    return httpClient.delete(`/guilds/${args.id}`);
};

type MutationHookArgs = {
    onSuccess?: () => void;
};

export const useDeleteGuildMutation = (args: MutationHookArgs) =>
    useMutation({
        mutationFn,
        onSuccess: () => (typeof args?.onSuccess === "function" ? args.onSuccess() : void 0),
        onError: () => {
            toast("An error occurred deleting guild, please try again later.");
        },
    });
