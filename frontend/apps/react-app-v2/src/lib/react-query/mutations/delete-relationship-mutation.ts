import { httpClient } from "@/lib/http-client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

type DeleteRelationshipMutationArgs = {
    id: string;
};

const mutationFn = async (args: DeleteRelationshipMutationArgs) => {
    return httpClient.delete(`/relationships/${args.id}`);
};

type MutationHookArgs = {
    onSuccess?: () => void;
};

export const useDeleteRelationshipMutation = (args?: MutationHookArgs) =>
    useMutation({
        mutationFn,
        onSuccess: () => (typeof args?.onSuccess === "function" ? args.onSuccess() : void 0),
        onError: () => {
            toast("An error occurred deleting relationship, please try again later.");
        },
    });
