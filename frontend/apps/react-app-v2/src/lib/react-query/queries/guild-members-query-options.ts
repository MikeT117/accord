import { infiniteQueryOptions, useInfiniteQuery } from "@tanstack/react-query";
import { getUnixTime } from "date-fns";
import { MAX_INFINITE_PAGE_LEN } from "../query-constants";
import { httpClient } from "@/lib/http-client";
import { guildMemberUsersSchema } from "@/lib/zod-validation/guild-member-user-schema";
import { toast } from "sonner";

type GuildMembersQueryArgs = {
    guildId: string;
    initialPageParam?: string | null;
    pageParam?: string | null;
};

export function guildMembersQueryOptions(args: GuildMembersQueryArgs) {
    return infiniteQueryOptions({
        maxPages: 4,
        queryKey: ["guild", args.guildId, "members"],
        queryFn: ({ pageParam }: { pageParam?: string | null | undefined }) =>
            httpClient
                .get(`/guilds/${args.guildId}/members?${pageParam ?? ""}limit=${MAX_INFINITE_PAGE_LEN}`, {
                    responseType: "json",
                })
                .then((r) => guildMemberUsersSchema.parse(r.data)),
        getNextPageParam: (lastPage) => {
            if (lastPage.length < MAX_INFINITE_PAGE_LEN) return null;
            return `before=${getUnixTime(lastPage[lastPage.length - 1].guildMember.createdAt)}&`;
        },
        getPreviousPageParam: (firstPage) => {
            if (firstPage.length < MAX_INFINITE_PAGE_LEN) return null;
            return `after=${getUnixTime(firstPage[0].guildMember.createdAt)}&`;
        },
        initialPageParam: args.initialPageParam,
        staleTime: Infinity,
    });
}

export function useGuildInvitesQuery(args: GuildMembersQueryArgs) {
    const { data, isError } = useInfiniteQuery(guildMembersQueryOptions(args));
    if (isError) {
        toast("An error occured while fetching server members, please try again later.");
    }
    return data;
}
