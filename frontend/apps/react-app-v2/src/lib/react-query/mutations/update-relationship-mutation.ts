import { httpClient } from "@/lib/http-client";
import { useMutation } from "@tanstack/react-query";
import { RELATIONSHIP_STATUS } from "@/lib/zod-validation/relationship-schema";
import type { ValueOf } from "@/lib/types/types";
import { toast } from "sonner";

type DeleteRelationshipMutationArgs = {
    id: string;
    status: ValueOf<typeof RELATIONSHIP_STATUS>;
};

const mutationFn = async ({ id, status }: DeleteRelationshipMutationArgs) => {
    return httpClient.patch(`/relationships/${id}`, { status });
};

type MutationHookArgs = {
    onSuccess?: () => void;
};

export const useUpdateRelationshipMutation = (args?: MutationHookArgs) =>
    useMutation({
        mutationFn,
        onSuccess: () => (typeof args?.onSuccess === "function" ? args.onSuccess() : void 0),
        onError: () => {
            toast("Unable to update relationship , please try again later.");
        },
    });
