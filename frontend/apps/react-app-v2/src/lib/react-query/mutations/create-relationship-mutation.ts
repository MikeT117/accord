import { httpClient } from "@/lib/http-client";
import type { ValueOf } from "@/lib/types/types";
import type { RELATIONSHIP_STATUS } from "@/lib/zod-validation/relationship-schema";
import { useMutation } from "@tanstack/react-query";

type CreateRelationshipMutationArgs = {
    username: string;
    status: ValueOf<typeof RELATIONSHIP_STATUS>;
};

const mutationFn = async (args: CreateRelationshipMutationArgs) => {
    return httpClient.post(`/relationships`, args);
};

type MutationHookArgs = {
    onSuccess?: () => void;
};

// OnError Will be handled globally with notifications, success will be handled by the component if needed.
export const useCreateRelationshipMutation = (args?: MutationHookArgs) =>
    useMutation({
        mutationFn,
        onSuccess: () => (typeof args?.onSuccess === "function" ? args.onSuccess() : void 0),
    });
