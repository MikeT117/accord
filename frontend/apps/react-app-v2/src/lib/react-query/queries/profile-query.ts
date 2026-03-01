import { httpClient } from "@/lib/http-client";
import { guildMemberSchema } from "@/lib/zod-validation/guild-member-schema";
import { userSchema } from "@/lib/zod-validation/user-schema";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

type GuildProfileQueryArgs = {
    guildId: string;
    memberId: string;
    enabled: boolean;
};

export function guildProfileQueryOptions({ memberId, guildId, enabled }: GuildProfileQueryArgs) {
    return queryOptions({
        queryKey: ["guild", guildId, "members", memberId],
        queryFn: () =>
            httpClient
                .get(`/guilds/${guildId}/members/${memberId}`, {
                    responseType: "json",
                })
                .then((r) => guildMemberSchema.parse(r.data)),
        staleTime: Infinity,
        enabled,
    });
}

export function useGuildProfileQuery(args: GuildProfileQueryArgs) {
    const { data, isError, error } = useQuery(guildProfileQueryOptions(args));
    if (isError) {
        console.error({ error });
        toast("An error occured while fetching guild members, please try again later.");
    }
    return data;
}

type UserProfileQueryArgs = {
    userId: string;
    enabled: boolean;
};

export function userProfileQueryOptions({ userId, enabled }: UserProfileQueryArgs) {
    return queryOptions({
        queryKey: ["user", userId, "profile"],
        queryFn: () =>
            httpClient
                .get(`/users/${userId}/profile`, {
                    responseType: "json",
                })
                .then((r) => userSchema.parse(r.data)),
        staleTime: Infinity,
        enabled,
    });
}

export function useUserProfileQuery(args: UserProfileQueryArgs) {
    const { data, isError, error } = useQuery(userProfileQueryOptions(args));
    if (isError) {
        console.error({ error });
        toast("An error occured while fetching guild members, please try again later.");
    }
    return data;
}
