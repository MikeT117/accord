import * as React from "react";
import { Trash2Icon, LockKeyholeIcon, LayoutDashboardIcon } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { closeGuildChannelSettings } from "@/lib/valtio/mutations/guild-channel-settings-ui-store-mutations";
import type { ValueOf } from "@/lib/types/types";
import { useGuildChannel } from "@/lib/valtio/queries/guild-store-queries";
import { GuildChannelSettingsOverviewSection } from "./guild-channel-settings-section-overview";
import { GuildChannelSettingsPermissionsSection } from "./guild-channel-settings-section-permissions";
import { GuildChannelSettingsDestructionSection } from "./guild-channel-settings-section-destruction";
import { SettingsDialogContent } from "../settings-dialog/settings-dialog-content";
import { SettingsDialogSidebar } from "../settings-dialog/settings-dialog-sidebar";
import { useGuildChannelSettingsState } from "@/lib/valtio/queries/guild-channel-settings-ui-store-queries";
import { isGuildCategoryChannel } from "@/lib/types/guards";
import { GuildCategoryChannelSettingsOverviewSection } from "./guild-channel-category-settings-section-overview";
import { GUILD_CHANNEL_TYPE } from "@/lib/zod-validation/channel-schema";

export function GuildChannelSettings() {
    const { isOpen, channelId, guildId } = useGuildChannelSettingsState();
    return (
        <Dialog open={isOpen} onOpenChange={closeGuildChannelSettings}>
            {isOpen && <GuildChannelSettingsContent channelId={channelId} guildId={guildId} />}
        </Dialog>
    );
}

const CHANNEL_SETTINGS_SECTION = {
    CHANNEL_OVERVIEW: 0,
    CHANNEL_PERMISSIONS: 1,
    DELETE_CHANNEL: 2,
} as const;

const sidebarItems = [
    {
        id: CHANNEL_SETTINGS_SECTION.CHANNEL_OVERVIEW,
        label: "Overview",
        icon: <LayoutDashboardIcon />,
    },
    {
        id: CHANNEL_SETTINGS_SECTION.CHANNEL_PERMISSIONS,
        label: "Permissions",
        icon: <LockKeyholeIcon />,
    },
    {
        id: CHANNEL_SETTINGS_SECTION.DELETE_CHANNEL,
        label: "Delete",
        icon: <Trash2Icon />,
    },
] as const;

type GuildChannelSettingsContentProps = { guildId: string; channelId: string };

function GuildChannelSettingsContent({ channelId, guildId }: GuildChannelSettingsContentProps) {
    const [activeSection, setActiveSection] = React.useState<ValueOf<typeof CHANNEL_SETTINGS_SECTION>>(
        CHANNEL_SETTINGS_SECTION.CHANNEL_OVERVIEW,
    );
    const channel = useGuildChannel(guildId, channelId);
    return (
        <SettingsDialogContent
            onClose={closeGuildChannelSettings}
            title={channel.name}
            sidebar={
                <SettingsDialogSidebar
                    sidebarItems={sidebarItems}
                    activeSection={activeSection}
                    setActiveSection={setActiveSection}
                />
            }
        >
            {activeSection === CHANNEL_SETTINGS_SECTION.CHANNEL_OVERVIEW &&
                (isGuildCategoryChannel(channel) ? (
                    <GuildCategoryChannelSettingsOverviewSection id={channel.id} name={channel.name} />
                ) : (
                    <GuildChannelSettingsOverviewSection
                        id={channel.id}
                        name={channel.name}
                        topic={channel.topic}
                        parentId={channel.parentId}
                    />
                ))}
            {activeSection === CHANNEL_SETTINGS_SECTION.CHANNEL_PERMISSIONS && (
                <GuildChannelSettingsPermissionsSection
                    id={channel.id}
                    guildId={channel.guildId}
                    parentId={
                        channel.channelType === GUILD_CHANNEL_TYPE.GUILD_CATEGORY_CHANNEL ? undefined : channel.parentId
                    }
                    channelType={channel.channelType}
                />
            )}

            {activeSection === CHANNEL_SETTINGS_SECTION.DELETE_CHANNEL && (
                <GuildChannelSettingsDestructionSection
                    id={channel.id}
                    name={channel.name}
                    channelType={channel.channelType}
                />
            )}
        </SettingsDialogContent>
    );
}
