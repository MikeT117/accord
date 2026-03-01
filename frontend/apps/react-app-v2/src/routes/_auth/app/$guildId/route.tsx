import { RootErrorComponent } from "@/components/error/error-component";
import { GuildCategoryCreator } from "@/components/guild-category-creator/create-guild-category-dialog";
import { GuildChannelCreator } from "@/components/guild-channel-creator/create-guild-channel-dialog";
import { GuildChannelSettings } from "@/components/guild-channel-settings/guild-channel-settings-dialog";
import { AttachmentGallery } from "@/components/attachment-gallery";
import { GuildSidebar } from "@/components/guild-sidebar/guild-sidebar";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { GuildSettings } from "@/components/guild-settings/guild-settings-dialog";
import { ErrGuildNotFound } from "@/lib/error";
import { doesGuildExist } from "@/lib/valtio/queries/guild-store-queries";

export const Route = createFileRoute("/_auth/app/$guildId")({
    component: RouteComponent,
    loader: ({ params: { guildId } }) => {
        if (!doesGuildExist(guildId)) {
            throw ErrGuildNotFound;
        }
    },
    errorComponent: (errProps) => <RootErrorComponent {...errProps} />,
});

function RouteComponent() {
    return (
        <>
            <GuildSidebar />
            <GuildSettings />
            <GuildChannelCreator />
            <GuildCategoryCreator />
            <GuildChannelSettings />
            <AttachmentGallery />
            <Outlet />
        </>
    );
}
