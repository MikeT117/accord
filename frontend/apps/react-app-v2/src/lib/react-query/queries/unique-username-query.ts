import { httpClient } from "@/lib/http-client";
import { uniqueUsernameSchema } from "@/lib/zod-validation/unique-username-schema";
import { queryOptions, useQuery } from "@tanstack/react-query";

type UniqueUsernameQueryArgs = {
    username: string;
};

function uniqueUsernameQueryOptions({ username }: UniqueUsernameQueryArgs) {
    return queryOptions({
        queryKey: ["unique-username", username],
        queryFn: () =>
            httpClient
                .get(`/auth/register/unique-username?username=${username}`)
                .then((r) => uniqueUsernameSchema.parse(r.data)),
        enabled: false,
        retry: false,
        staleTime: Infinity,
    });
}

export function useUniqueUsernameQuery(args: UniqueUsernameQueryArgs) {
    return useQuery(uniqueUsernameQueryOptions(args));
}
