import { infiniteQueryOptions, useInfiniteQuery } from "@tanstack/react-query";
import { getUnixTime } from "date-fns";
import { MAX_INFINITE_PAGE_LEN } from "../query-constants";
import { httpClient } from "@/lib/http-client";
import { guildMemberUsersSchema } from "@/lib/zod-validation/guild-member-user-schema";
import { toast } from "sonner";

type GuildRoleMemberQueryQueryArgs = {
    guildId: string;
    roleId: string;
    assigned: boolean;
    initialPageParam?: string | null;
    pageParam?: string | null;
};

export function guildRoleMemberQueryOptions(args: GuildRoleMemberQueryQueryArgs) {
    return infiniteQueryOptions({
        maxPages: 4,
        queryKey: ["role", args.roleId, "members", "assigned", args.assigned],
        queryFn: ({ pageParam }: { pageParam?: string | null | undefined }) =>
            httpClient
                .get(
                    `/guilds/${args.guildId}/roles/${args.roleId}/members?${pageParam ?? ""}limit=${MAX_INFINITE_PAGE_LEN}&assigned=${args.assigned}`,
                    {
                        responseType: "json",
                    },
                )
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

export function useGuildRoleMembersQuery(args: GuildRoleMemberQueryQueryArgs) {
    const { data, isError } = useInfiniteQuery(guildRoleMemberQueryOptions(args));
    if (isError) {
        toast("An error occured while fetching server role members, please try again later.");
    }

    return data;
}
