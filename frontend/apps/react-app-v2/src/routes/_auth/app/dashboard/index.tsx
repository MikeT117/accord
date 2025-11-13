import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/app/dashboard/")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <div className="flex h-full items-center justify-center p-4">
            <h1 className="text-xl text-muted-foreground">Select a channel to view and send messages!</h1>
        </div>
    );
}
