import { RootErrorComponent } from "@/components/error/error-component";
import { ErrChannelNotFound } from "@/lib/error";
import { doesGuildChannelExist } from "@/lib/valtio/queries/guild-store-queries";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/app/$guildId/$channelId")({
    component: RouteComponent,
    errorComponent: (errProps) => <RootErrorComponent {...errProps} />,
    loader: ({ params: { guildId, channelId } }) => {
        const channelExist = doesGuildChannelExist(guildId, channelId);
        if (!channelExist) {
            throw ErrChannelNotFound;
        }
    },
});

function RouteComponent() {
    return <Outlet />;
}
