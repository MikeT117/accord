import { useCreateGuildMember } from "@/lib/react-query/mutations/create-guild-member-mutation";
import { useInfiniteDiscoverableGuildQuery } from "@/lib/react-query/queries/discoverable-guilds-query";
import { GlobeIcon, SearchIcon } from "lucide-react";
import { ChangeEvent, useState } from "react";
import { GuildCard } from "./guild-card";
import { ScrollArea } from "../ui/scroll-area";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group";
import { useNavigate } from "@tanstack/react-router";

export function GuildBrowser() {
    const [filter, setFilter] = useState("");
    const { data, infiniteScrollRef } = useInfiniteDiscoverableGuildQuery();
    const { mutate } = useCreateGuildMember();
    const navigate = useNavigate();

    function handleJoinGuildClick(guildId: string) {
        mutate({ guildId });
    }

    const filteredGuilds = filter.trim().length
        ? data.filter((g) => g.name.toLowerCase().includes(filter.toLowerCase()))
        : data;

    function handleFilterChange(e: ChangeEvent<HTMLInputElement, HTMLInputElement>) {
        setFilter(e.currentTarget.value);
    }

    function handleGoToClick(guildId: string) {
        navigate({ to: "/app/$guildId", params: { guildId } });
    }

    return (
        <ScrollArea className="col-span-2 h-svh w-full px-4 py-10">
            <div className="mx-auto max-w-6xl">
                <header className="mb-8 text-center">
                    <div className="mb-2 flex items-center justify-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                            <GlobeIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-balance text-foreground/70 dark:text-muted-foreground">
                            Public Guilds
                        </h1>
                    </div>
                    <p className="mt-1 text-sm font-medium text-muted-foreground/70">
                        Discover communities to connect, share, and grow with.
                    </p>
                </header>
                <div className="relative mx-auto mb-8 max-w-md">
                    <InputGroup className="mt-4">
                        <InputGroupInput placeholder="Search guilds..." value={filter} onChange={handleFilterChange} />
                        <InputGroupAddon>
                            <SearchIcon />
                        </InputGroupAddon>
                        <InputGroupAddon align="inline-end">{filteredGuilds.length} results</InputGroupAddon>
                    </InputGroup>
                </div>

                <div className="flex flex-wrap justify-center gap-4">
                    {filteredGuilds.map((g, i) => (
                        <GuildCard
                            key={g.id}
                            banner={g.banner}
                            createdAt={g.createdAt}
                            description={g.description}
                            icon={g.icon}
                            id={g.id}
                            memberCount={g.memberCount}
                            name={g.name}
                            ref={(e) => infiniteScrollRef(i, e)}
                            onJoin={() => handleJoinGuildClick(g.id)}
                            onGoTo={() => handleGoToClick(g.id)}
                        />
                    ))}
                </div>
            </div>
        </ScrollArea>
    );
}
