import { infiniteQueryOptions, useInfiniteQuery } from "@tanstack/react-query";
import { getUnixTime } from "date-fns";
import { MAX_INFINITE_PAGE_LEN } from "../query-constants";
import { httpClient } from "@/lib/http-client";
import { guildBansSchema } from "@/lib/zod-validation/guild-ban-schema";
import { toast } from "sonner";

type GuildBansQueryArgs = {
    guildId: string;
    initialPageParam?: string | null;
    pageParam?: string | null;
};

export function guildBansQueryOptions(args: GuildBansQueryArgs) {
    return infiniteQueryOptions({
        maxPages: 4,
        queryKey: ["guild", args.guildId, "bans"],
        queryFn: ({ pageParam }: { pageParam?: string | null | undefined }) =>
            httpClient
                .get(`/guilds/${args.guildId}/bans?${pageParam ?? ""}limit=${MAX_INFINITE_PAGE_LEN}`, {
                    responseType: "json",
                })
                .then((r) => guildBansSchema.parse(r.data)),
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

export function useGuildBansQuery(guildId: string) {
    const { data, isError } = useInfiniteQuery(guildBansQueryOptions({ guildId }));
    if (isError) {
        toast("An error occured while fetching server bans, please try again later.");
    }
    return data;
}
