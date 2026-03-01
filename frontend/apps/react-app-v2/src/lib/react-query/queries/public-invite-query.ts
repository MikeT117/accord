import { httpClient } from "@/lib/http-client";
import { publicInviteSchema } from "@/lib/zod-validation/public-invite-schema";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

type PublicInviteQueryArgs = {
    id: string;
    enabled: boolean;
};

function publicInviteQueryOptions({ id, enabled }: PublicInviteQueryArgs) {
    return queryOptions({
        queryKey: ["public-invite", id],
        queryFn: () => httpClient.get(`/invite/${id}`).then((r) => publicInviteSchema.parse(r.data)),
        enabled: enabled,
        retry: (_, err) => {
            if (err instanceof AxiosError) {
                // @ts-ignore - Type is incorrect, cause.status is prresent and provides the reponse code.
                return err.cause.status !== 404;
            }
            return true;
        },
        staleTime: Infinity,
    });
}

export function usePublicInviteQuery(args: PublicInviteQueryArgs) {
    return useQuery(publicInviteQueryOptions(args));
}
