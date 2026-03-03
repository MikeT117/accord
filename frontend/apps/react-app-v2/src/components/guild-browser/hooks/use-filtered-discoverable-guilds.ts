import { useInfiniteDiscoverableGuildsQuery } from "@/lib/react-query/queries/discoverable-guilds-query";
import { ChangeEvent, useState } from "react";

export function useFilteredDiscoverableGuilds() {
    const [guildFilter, setGuildFilter] = useState("");
    const { data, infiniteScrollRef } = useInfiniteDiscoverableGuildsQuery();

    const filteredGuilds = guildFilter.trim().length
        ? data.filter((g) => g.name.toLowerCase().includes(guildFilter.toLowerCase()))
        : data;

    function handleFilterChange(e: ChangeEvent<HTMLInputElement, HTMLInputElement>) {
        setGuildFilter(e.currentTarget.value);
    }

    return { guilds: filteredGuilds, guildFilter, setGuildFilter: handleFilterChange, infiniteScrollRef };
}
