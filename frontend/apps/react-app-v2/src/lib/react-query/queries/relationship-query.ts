import { infiniteQueryOptions, useInfiniteQuery } from "@tanstack/react-query";
import type { RelationshipType } from "@/lib/types/types";
import { httpClient } from "@/lib/http-client";
import { getUnixTime } from "date-fns";
import { relationshipsSchema } from "@/lib/zod-validation/relationship-schema";
import { MAX_INFINITE_PAGE_LEN } from "../query-constants";
import { toast } from "sonner";

type RelationshipQueryArgs = {
    initialPageParam?: string | null;
    pageParam?: string | null;
    relationshipStatus: number;
};

export function relationshipQueryOptions(args: RelationshipQueryArgs) {
    return infiniteQueryOptions({
        queryKey: ["relationships", args.relationshipStatus, args.pageParam],
        queryFn: ({ pageParam }: { pageParam?: string | null | undefined }) =>
            httpClient
                .get<RelationshipType[]>(`/relationships`, {
                    responseType: "json",
                    withCredentials: true,
                    params: {
                        before: pageParam,
                        status: args.relationshipStatus,
                    },
                })
                .then((r) => relationshipsSchema.parse(r.data)),
        getNextPageParam: (lastPage) => {
            if (lastPage.length < MAX_INFINITE_PAGE_LEN) {
                return;
            }
            return getUnixTime(lastPage[lastPage.length - 1].createdAt).toString();
        },
        initialPageParam: args.initialPageParam,
        staleTime: 60 * 1000,
    });
}

export function useGuildRoleMembersQuery(args: RelationshipQueryArgs) {
    const { data, isError } = useInfiniteQuery(relationshipQueryOptions(args));
    if (isError) {
        toast("An error occured while fetching relationships, please try again later.");
    }
    return data;
}
