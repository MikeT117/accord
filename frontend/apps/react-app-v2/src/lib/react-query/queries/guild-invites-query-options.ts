import { infiniteQueryOptions, useInfiniteQuery } from "@tanstack/react-query";
import { getUnixTime } from "date-fns";
import { MAX_INFINITE_PAGE_LEN } from "../query-constants";
import { httpClient } from "@/lib/http-client";
import { guildInvitesSchema } from "@/lib/zod-validation/guild-invite-schema";
import { toast } from "sonner";

type GuildInvitesQueryArgs = {
    guildId: string;
    initialPageParam?: string | null;
    pageParam?: string | null;
};

export function guildInvitesQueryOptions(args: GuildInvitesQueryArgs) {
    return infiniteQueryOptions({
        maxPages: 4,
        queryKey: ["guild", args.guildId, "invites"],
        queryFn: ({ pageParam }: { pageParam?: string | null | undefined }) =>
            httpClient
                .get(`/guilds/${args.guildId}/invites?${pageParam ?? ""}limit=${MAX_INFINITE_PAGE_LEN}`, {
                    responseType: "json",
                })
                .then((r) => guildInvitesSchema.parse(r.data)),
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

export function useGuildInvitesQuery(args: GuildInvitesQueryArgs) {
    const { data, isError } = useInfiniteQuery(guildInvitesQueryOptions(args));
    if (isError) {
        toast("An error occured while fetching server invites, please try again later.");
    }
    return data;
}
