import { infiniteQueryOptions } from "@tanstack/react-query";
import type { ChannelMessageType } from "@/lib/types/types";
import { getUnixTime } from "date-fns";
import { MAX_INFINITE_PAGE_LEN } from "../query-constants";
import { httpClient } from "@/lib/http-client";
import { sessionsSchema } from "@/lib/zod-validation/session-schema";

type SessionQueryArgs = {
    initialPageParam?: string | null;
    pageParam?: string | null;
};

export function sessionQueryOptions(args: SessionQueryArgs) {
    return infiniteQueryOptions({
        maxPages: 4,
        queryKey: ["sessions"],
        queryFn: ({ pageParam }: { pageParam?: string | null | undefined }) =>
            httpClient
                .get<ChannelMessageType[]>(`/sessions?${pageParam ?? ""}limit=${MAX_INFINITE_PAGE_LEN}`, {
                    responseType: "json",
                })
                .then((r) => sessionsSchema.parse(r.data)),
        getNextPageParam: (lastPage) => {
            if (lastPage.length < MAX_INFINITE_PAGE_LEN) return null;
            return `before=${getUnixTime(lastPage[lastPage.length - 1].createdAt)}&`;
        },
        getPreviousPageParam: (firstPage) => {
            if (firstPage.length < MAX_INFINITE_PAGE_LEN) return null;
            return `after=${getUnixTime(firstPage[0].createdAt)}&`;
        },
        initialPageParam: args.initialPageParam,
        staleTime: Infinity,
    });
}
