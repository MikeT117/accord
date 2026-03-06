import { useCreateGuildMember } from "@/lib/react-query/mutations/create-guild-member-mutation";
import { GlobeIcon, SearchIcon } from "lucide-react";
import { GuildCard } from "../guild-card";
import { ScrollArea } from "../ui/scroll-area";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group";
import { useNavigate } from "@tanstack/react-router";
import { useFilteredDiscoverableGuilds } from "./hooks/use-filtered-discoverable-guilds";

export function GuildBrowser() {
    const { guildFilter, guilds, infiniteScrollRef, setGuildFilter } = useFilteredDiscoverableGuilds();
    const { mutate } = useCreateGuildMember();
    const navigate = useNavigate();

    function handleJoinGuildClick(guildId: string) {
        mutate({ guildId });
    }

    function handleGoToClick(guildId: string) {
        navigate({ to: "/app/$guildId", params: { guildId } });
    }

    return (
        <ScrollArea className="col-span-2 h-svh w-full px-4 py-6">
            <div className="mx-auto max-w-6xl">
                <header className="mb-8 text-center">
                    <div className="mb-2 flex items-center justify-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                            <GlobeIcon className="size-5" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-balance text-foreground">
                            Public Guilds
                        </h1>
                    </div>
                    <p className="mt-1 text-sm font-medium text-wrap text-muted-foreground">
                        From gaming, to music, there's a place for you.
                    </p>
                </header>
                <div className="relative mx-auto mb-8 max-w-xl">
                    <InputGroup className="mt-4">
                        <InputGroupInput placeholder="Search guilds..." value={guildFilter} onChange={setGuildFilter} />
                        <InputGroupAddon>
                            <SearchIcon />
                        </InputGroupAddon>
                        <InputGroupAddon align="inline-end">{guilds.length} results</InputGroupAddon>
                    </InputGroup>
                </div>
                <div className="flex flex-wrap justify-center gap-4">
                    {guilds.map((g, i) => (
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
