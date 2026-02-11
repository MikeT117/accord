import {
    type InfiniteData,
    infiniteQueryOptions,
    useInfiniteQuery,
    useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import type { DiscoverableGuildType } from "@/lib/types/types";
import { getUnixTime } from "date-fns";
import { MAX_INFINITE_PAGE_LEN } from "../query-constants";
import { httpClient } from "@/lib/http-client";
import { useInfiniteScroll } from "../hooks/use-infinite-scroll";
import { discoverableGuildsSchema } from "@/lib/zod-validation/guild-schema";

type PageParam = { before: string; after?: never } | { after: string; before?: never } | null | undefined;

type DiscoverableGuildsQueryArgs = {
    initialPageParam?: PageParam;
    pageParam?: string | null;
};

export function discoverableGuildQueryOptions(args: DiscoverableGuildsQueryArgs) {
    const queryKey = ["guilds", "discoverable"];

    return infiniteQueryOptions<
        DiscoverableGuildType[],
        Error,
        InfiniteData<DiscoverableGuildType[]>,
        typeof queryKey,
        PageParam
    >({
        maxPages: 4,
        queryKey,
        queryFn: ({ pageParam }) =>
            httpClient
                .get(`/guilds/discoverable`, {
                    params: {
                        limit: MAX_INFINITE_PAGE_LEN,
                        ...pageParam,
                    },
                    responseType: "json",
                })
                .then((r) => discoverableGuildsSchema.parse(r.data)),
        getNextPageParam: (lastPage) => {
            if (lastPage.length < MAX_INFINITE_PAGE_LEN) {
                return null;
            }
            return { before: `${getUnixTime(lastPage[lastPage.length - 1].createdAt)}` };
        },
        getPreviousPageParam: (firstPage) => {
            if (firstPage.length < MAX_INFINITE_PAGE_LEN) {
                return null;
            }
            return { after: `${getUnixTime(firstPage[0].createdAt)}` };
        },
        initialPageParam: args.initialPageParam,
        staleTime: Infinity,
    });
}

export function useSuspenseInfiniteDiscoverableGuildQuery() {
    const { data, hasNextPage, hasPreviousPage, fetchPreviousPage, fetchNextPage } = useSuspenseInfiniteQuery(
        discoverableGuildQueryOptions({}),
    );

    return useInfiniteScroll(data.pages.flat() ?? [], hasPreviousPage, hasNextPage, fetchPreviousPage, fetchNextPage);
}

export function useInfiniteDiscoverableGuildQuery() {
    const { data, hasNextPage, hasPreviousPage, fetchPreviousPage, fetchNextPage } = useInfiniteQuery(
        discoverableGuildQueryOptions({}),
    );

    return useInfiniteScroll(data?.pages.flat() ?? [], hasPreviousPage, hasNextPage, fetchPreviousPage, fetchNextPage);
}
