import { RootErrorComponent } from "@/components/error/error-component";
import { GuildCard } from "@/components/guild-browser/guild-card";

import { Input } from "@/components/ui/input";
import { useCreateGuildMember } from "@/lib/react-query/mutations/create-guild-member-mutation";
import {
    discoverableGuildQueryOptions,
    useInfiniteDiscoverableGuildQuery,
} from "@/lib/react-query/queries/discoverable-guilds-query";
import { createFileRoute } from "@tanstack/react-router";
import { GlobeIcon, SearchIcon } from "lucide-react";
import { useState } from "react";

type RouteQueryOptions = {
    before?: string | null | undefined;
};

export const Route = createFileRoute("/_auth/app/guild-browser/")({
    validateSearch: (search: Record<string, unknown>): RouteQueryOptions => {
        return { before: (search.before as string) || undefined };
    },
    loaderDeps: ({ search }) => ({ before: search.before }),
    loader: ({ context: { queryClient } }) => {
        return queryClient.ensureInfiniteQueryData(discoverableGuildQueryOptions({}));
    },
    errorComponent: (errProps) => <RootErrorComponent {...errProps} />,
    component: RouteComponent,
});

function RouteComponent() {
    const [filter, setFilter] = useState("");
    const { data, infiniteScrollRef } = useInfiniteDiscoverableGuildQuery();
    const { mutate } = useCreateGuildMember();

    function handleJoinGuildClick(guildId: string) {
        mutate({ guildId });
    }

    const filtered = filter.trim().length
        ? data.filter((g) => g.name.toLowerCase().includes(filter.toLowerCase()))
        : data;

    return (
        <div className="col-span-2 mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
            <header className="mb-8 text-center">
                <div className="mb-2 flex items-center justify-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                        <GlobeIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-balance text-foreground/70 dark:text-muted-foreground">
                        Public Servers
                    </h1>
                </div>
                <p className="mt-1 text-sm font-medium text-muted-foreground/70">
                    Discover communities to connect, share, and grow with.
                </p>
            </header>
            <div className="relative mx-auto mb-8 max-w-md">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Search servers..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="border-border bg-secondary pl-9 placeholder:text-muted-foreground focus-visible:ring-primary/50"
                    aria-label="Filter servers by name or description"
                />
            </div>
            <p className="mb-4 text-xs font-medium text-muted-foreground">
                {filtered.length === data.length
                    ? `${data.length} servers available`
                    : `${filtered.length} of ${data.length} servers`}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((g, i) => (
                    <GuildCard
                        key={g.id}
                        guild={g}
                        ref={(e) => infiniteScrollRef(i, e)}
                        onJoin={() => handleJoinGuildClick(g.id)}
                    />
                ))}
            </div>
        </div>
    );
}
