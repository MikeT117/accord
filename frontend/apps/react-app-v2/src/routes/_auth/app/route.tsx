import { tokenStore } from "@/lib/valtio/stores/token-store";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar/app-sidebar";
import { tokensSchema } from "@/lib/zod-validation/localstorage-schema";
import { ConfirmActionDialog } from "@/components/confirm-action-dialog";
import { GuildCreator } from "@/components/guild-creator/create-guild-dialog";
import { AppInitialisingLoader } from "@/components/app-initialising-loader";
import { UserSettings } from "@/components/user-settings/user-settings-dialog";
import { GuildSettings } from "@/components/guild-settings/guild-settings-dialog";
import { Toaster } from "sonner";

export const Route = createFileRoute("/_auth/app")({
    beforeLoad: async ({ context, cause }) => {
        const { success } = tokensSchema.safeParse(tokenStore);
        if (!success) throw redirect({ to: "/" });
        if (cause === "enter") await context.eventWebsocket.connect();
    },
    onLeave: ({ context }) => context.eventWebsocket.shutdown(),
    pendingComponent: () => <AppInitialisingLoader />,
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <div className="grid h-screen w-screen grid-cols-[min-content_250px_1fr_min-content]">
            <AppSidebar />
            <Outlet />
            <ConfirmActionDialog />
            <GuildCreator />
            <UserSettings />
            <GuildSettings />
            <Toaster />
        </div>
    );
}
