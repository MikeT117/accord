import { RootErrorComponent } from "@/components/error/error-component";
import { GuildCategoryCreator } from "@/components/guild-category-creator/create-guild-category-dialog";
import { GuildCategoryChannelSettings } from "@/components/guild-channel-category-settings/guild-channel-category-settings-dialog";
import { GuildChannelCreator } from "@/components/guild-channel-creator/create-guild-channel-dialog";
import { GuildChannelSettings } from "@/components/guild-channel-settings/guild-channel-settings-dialog";
import { AttachmentGallery } from "@/components/attachment-gallery";
import { GuildSidebar } from "@/components/guild-sidebar/guild-sidebar";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { GuildSettings } from "@/components/guild-settings/guild-settings-dialog";

export const Route = createFileRoute("/_auth/app/$guildId")({
    component: RouteComponent,
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
            <GuildCategoryChannelSettings />
            <AttachmentGallery />
            <Outlet />
        </>
    );
}
