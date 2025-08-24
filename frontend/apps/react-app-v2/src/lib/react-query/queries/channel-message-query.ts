import {
    type InfiniteData,
    infiniteQueryOptions,
    useInfiniteQuery,
    useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import type { ChannelMessageType } from "@/lib/types/types";
import { channelMessagesSchema } from "@/lib/zod-validation/channel-mesage-schema";
import { getUnixTime } from "date-fns";
import { MAX_INFINITE_PAGE_LEN } from "../query-constants";
import { httpClient } from "@/lib/http-client";
import { useInView } from "react-intersection-observer";

type PageParam = { before: string; after?: never } | { after: string; before?: never } | null | undefined;

type ChannelMessageQueryArgs = {
    channelId: string;
    initialPageParam?: PageParam;
    pageParam?: string | null;
    pinned?: boolean;
};

export function channelMessageQueryOptions(args: ChannelMessageQueryArgs) {
    const queryKey =
        typeof args.pinned !== "undefined"
            ? ["channel", args.channelId, "messages", "pinned", args.pinned]
            : ["channel", args.channelId, "messages"];

    return infiniteQueryOptions<
        ChannelMessageType[],
        Error,
        InfiniteData<ChannelMessageType[]>,
        typeof queryKey,
        PageParam
    >({
        maxPages: 4,
        queryKey,
        queryFn: ({ pageParam }) =>
            httpClient
                .get(`/channels/${args.channelId}/messages`, {
                    params: {
                        pinned: args.pinned,
                        limit: MAX_INFINITE_PAGE_LEN,
                        ...pageParam,
                    },
                    responseType: "json",
                })
                .then((r) => channelMessagesSchema.parse(r.data)),
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

function useInfiniteLoad(
    messages: ChannelMessageType[],
    hasPreviousPage: boolean,
    hasNextPage: boolean,
    fetchPreviousPage: () => void,
    fetchNextPage: () => void,
) {
    const [prevRef] = useInView({
        threshold: 0.01,
        onChange: (inView) => {
            if (!hasPreviousPage || !inView) {
                return;
            }
            fetchPreviousPage();
        },
    });

    const [nextRef] = useInView({
        threshold: 0.01,
        onChange: (inView) => {
            if (!hasNextPage || !inView) {
                return;
            }
            fetchNextPage();
        },
    });

    function infiniteScrollRef(index: number, elem: HTMLElement | null) {
        if (!elem) {
            return;
        }

        if (messages.length < 2) {
            return;
        }

        if (index === 0) {
            prevRef(elem);
        }

        if (index === messages.length - 1) {
            nextRef(elem);
        }
    }

    return { messages, infiniteScrollRef };
}

type ChannelMessageQueryHookArgs = {
    channelId: string;
    pinned?: boolean;
};

export function useSuspenseInfiniteChannelMessagesQuery({ channelId, pinned }: ChannelMessageQueryHookArgs) {
    const { data, hasNextPage, hasPreviousPage, fetchPreviousPage, fetchNextPage } = useSuspenseInfiniteQuery(
        channelMessageQueryOptions({ channelId, pinned }),
    );

    return useInfiniteLoad(data.pages.flat() ?? [], hasPreviousPage, hasNextPage, fetchPreviousPage, fetchNextPage);
}

export function useInfiniteChannelMessagesQuery({ channelId, pinned }: ChannelMessageQueryHookArgs) {
    const { data, hasNextPage, hasPreviousPage, fetchPreviousPage, fetchNextPage } = useInfiniteQuery(
        channelMessageQueryOptions({ channelId, pinned }),
    );

    return useInfiniteLoad(data?.pages.flat() ?? [], hasPreviousPage, hasNextPage, fetchPreviousPage, fetchNextPage);
}
