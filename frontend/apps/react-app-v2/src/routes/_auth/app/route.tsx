import { tokenStore } from "@/lib/valtio/stores/token-store";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar/app-sidebar";
import { tokensSchema } from "@/lib/zod-validation/localstorage-schema";
import { AppInitialisation } from "@/components/app-initialisation";

export const Route = createFileRoute("/_auth/app")({
    beforeLoad: async ({ context, cause }) => {
        const { success } = tokensSchema.safeParse(tokenStore);
        if (!success) throw redirect({ to: "/" });
        if (cause === "enter") await context.eventWebsocket.connect();
    },
    onLeave: ({ context }) => context.eventWebsocket.shutdown(),
    pendingComponent: () => <AppInitialisation />,
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <div className="grid h-screen w-screen grid-cols-[min-content_250px_1fr_min-content]">
            <AppSidebar />
            <Outlet />
        </div>
    );
}
