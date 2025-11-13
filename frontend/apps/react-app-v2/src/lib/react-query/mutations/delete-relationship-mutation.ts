import { httpClient } from "@/lib/http-client";
import { useMutation } from "@tanstack/react-query";

type DeleteRelationshipMutationArgs = {
    id: string;
};

const mutationFn = async (args: DeleteRelationshipMutationArgs) => {
    return httpClient.delete(`/relationships/${args.id}`);
};

type MutationHookArgs = {
    onSuccess?: () => void;
};

// OnError Will be handled globally with notifications, success will be handled by the component if needed.
export const useDeleteRelationshipMutation = (args?: MutationHookArgs) =>
    useMutation({
        mutationFn,
        onSuccess: () => (typeof args?.onSuccess === "function" ? args.onSuccess() : void 0),
    });
