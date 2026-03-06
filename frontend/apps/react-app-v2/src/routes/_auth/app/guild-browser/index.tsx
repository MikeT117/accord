import { ErrorManager } from "@/components/error/error-manager";
import { GuildBrowser } from "@/components/guild-browser/guild-browser";
import { AppContent } from "@/components/layout/app-content";
import { AppHeader } from "@/components/layout/app-header";
import { discoverableGuildQueryOptions } from "@/lib/react-query/queries/discoverable-guilds-query";
import { createFileRoute } from "@tanstack/react-router";

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
    errorComponent: (errProps) => <ErrorManager {...errProps} />,
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <>
            <AppHeader>
                <span className="text-sm font-medium text-muted-foreground">Guild Browser</span>
            </AppHeader>
            <AppContent>
                <GuildBrowser />
            </AppContent>
        </>
    );
}
