import * as React from "react";
import { Hash, Users, Trash2Icon } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { useGuildChannelSettingsState } from "@/lib/valtio/queries/guild-channel-settings-ui-store-queries";
import { closeGuildChannelSettings } from "@/lib/valtio/mutations/guild-channel-settings-ui-store-mutations";
import type { ValueOf } from "@/lib/types/types";
import { useGuildTextChannel } from "@/lib/valtio/queries/guild-store-queries";
import { GuildChannelSettingsOverviewSection } from "./guild-channel-settings-section-overview";
import { GuildChannelSettingsPermissionsSection } from "./guild-channel-settings-section-permissions";
import { GuildChannelSettingsDestructionSection } from "./guild-channel-settings-section-destruction";
import { SettingsDialogContent } from "../settings-dialog/settings-dialog-content";
import { SettingsDialogSidebar } from "../settings-dialog/settings-dialog-sidebar";

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
        label: "Channel Overview",
        icon: <Hash />,
        description: "View channel information",
    },
    {
        id: CHANNEL_SETTINGS_SECTION.CHANNEL_PERMISSIONS,
        label: "Channel Permissions",
        icon: <Users />,
        description: "Manage channel permissions",
    },
    {
        id: CHANNEL_SETTINGS_SECTION.DELETE_CHANNEL,
        label: "Delete Channel",
        icon: <Trash2Icon />,
        description: "Permanently delete this channel",
    },
] as const;

type GuildChannelSettingsContentProps = { guildId: string; channelId: string };

function GuildChannelSettingsContent({ channelId, guildId }: GuildChannelSettingsContentProps) {
    const [activeSection, setActiveSection] = React.useState<ValueOf<typeof CHANNEL_SETTINGS_SECTION>>(
        CHANNEL_SETTINGS_SECTION.CHANNEL_OVERVIEW
    );
    const channel = useGuildTextChannel(guildId, channelId);
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
            {activeSection === CHANNEL_SETTINGS_SECTION.CHANNEL_OVERVIEW && (
                <GuildChannelSettingsOverviewSection
                    id={channel.id}
                    name={channel.name}
                    topic={channel.topic}
                    parentId={channel.parentId}
                />
            )}
            {activeSection === CHANNEL_SETTINGS_SECTION.CHANNEL_PERMISSIONS && (
                <GuildChannelSettingsPermissionsSection guildId={channel.guildId} id={channel.id} />
            )}
            {activeSection === CHANNEL_SETTINGS_SECTION.DELETE_CHANNEL && (
                <GuildChannelSettingsDestructionSection id={channel.id} name={channel.name} />
            )}
        </SettingsDialogContent>
    );
}
