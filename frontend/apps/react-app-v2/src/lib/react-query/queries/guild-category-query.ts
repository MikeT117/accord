import { queryOptions, useQuery } from "@tanstack/react-query";
import type { ChannelMessageType } from "@/lib/types/types";
import { httpClient } from "@/lib/http-client";
import { guildCategoriesSchema } from "@/lib/zod-validation/guild-category-schema";
import { toast } from "sonner";

export const guildCategoryQueryOptions = queryOptions({
    queryKey: ["guild-categories"],
    queryFn: () =>
        httpClient
            .get<ChannelMessageType[]>(`/guild-categories`, {
                responseType: "json",
            })
            .then((r) => guildCategoriesSchema.parse(r.data)),

    staleTime: Infinity,
});

export function useGuildCategoriesQuery() {
    const { data, isError } = useQuery(guildCategoryQueryOptions);
    if (isError) {
        toast("An error occured while fetching server categories, please try again later.");
    }
    return data;
}
