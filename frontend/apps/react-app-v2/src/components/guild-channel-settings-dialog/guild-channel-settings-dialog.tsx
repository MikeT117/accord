import * as React from "react";
import { Trash2Icon, LockKeyholeIcon, LayoutDashboardIcon } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import type { ValueOf } from "@/lib/types/types";
import { GuildChannelSettingsOverviewSection } from "./guild-channel-settings-section-overview";
import { GuildChannelSettingsPermissionsSection } from "./guild-channel-settings-section-permissions";
import { GuildChannelSettingsDestructionSection } from "./guild-channel-settings-section-destruction";
import { SettingsDialogContent } from "../settings-dialog/settings-dialog-content";
import { SettingsDialogSidebar } from "../settings-dialog/settings-dialog-sidebar";
import { isGuildCategoryChannel } from "@/lib/types/guards";
import { GuildCategoryChannelSettingsOverviewSection } from "./guild-channel-category-settings-section-overview";
import { GUILD_CHANNEL_TYPE } from "@/lib/zod-validation/channel-schema";
import { useGuildChannel } from "@/lib/zustand/stores/guild-store";

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

type GuildChannelSettingsDialogProps = {
    channelId: string;
    guildId: string;
    onClose: () => void;
};

export function GuildChannelSettingsDialog({ channelId, guildId, onClose }: GuildChannelSettingsDialogProps) {
    const [activeSection, setActiveSection] = React.useState<ValueOf<typeof CHANNEL_SETTINGS_SECTION>>(
        CHANNEL_SETTINGS_SECTION.CHANNEL_OVERVIEW,
    );
    const channel = useGuildChannel(guildId, channelId);
    return (
        <Dialog defaultOpen={true} onOpenChange={onClose}>
            <SettingsDialogContent
                onClose={onClose}
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
                            channel.channelType === GUILD_CHANNEL_TYPE.GUILD_CATEGORY_CHANNEL
                                ? undefined
                                : channel.parentId
                        }
                        channelType={channel.channelType}
                    />
                )}

                {activeSection === CHANNEL_SETTINGS_SECTION.DELETE_CHANNEL && (
                    <GuildChannelSettingsDestructionSection
                        id={channel.id}
                        name={channel.name}
                        channelType={channel.channelType}
                        onClose={onClose}
                    />
                )}
            </SettingsDialogContent>
        </Dialog>
    );
}
