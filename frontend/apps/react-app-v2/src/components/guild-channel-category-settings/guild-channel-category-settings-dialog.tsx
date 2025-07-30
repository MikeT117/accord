import * as React from "react";
import { Hash, Users, Trash2Icon } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import type { ValueOf } from "@/lib/types/types";
import { useGuildCategoryChannel } from "@/lib/valtio/queries/guild-store-queries";
import { SettingsDialogContent } from "../settings-dialog/settings-dialog-content";
import { SettingsDialogSidebar } from "../settings-dialog/settings-dialog-sidebar";
import { GuildCategoryChannelSettingsDestructionSection } from "./guild-channel-category-settings-section-destruction";
import { GuildCategoryChannelSettingsOverviewSection } from "./guild-channel-category-settings-section-overview";
import { GuildCategoryChannelSettingsPermissionsSection } from "./guild-channel-category-settings-section-permissions";
import { useGuildCategoryChannelSettingsState } from "@/lib/valtio/queries/guild-category-channel-settings-ui-store-queries";
import { closeGuildCategoryChannelSettings } from "@/lib/valtio/mutations/guild-category-channel-settings-ui-store-mutations";

export function GuildCategoryChannelSettings() {
    const { isOpen, channelId, guildId } = useGuildCategoryChannelSettingsState();
    return (
        <Dialog open={isOpen} onOpenChange={closeGuildCategoryChannelSettings}>
            {isOpen && <GuildCategoryChannelSettingsContent channelId={channelId} guildId={guildId} />}
        </Dialog>
    );
}

const CATEGORY_SETTINGS_SECTION = {
    OVERVIEW: 0,
    PERMISSIONS: 1,
    DELETION: 2,
} as const;

const sidebarItems = [
    {
        id: CATEGORY_SETTINGS_SECTION.OVERVIEW,
        label: "Category Overview",
        icon: <Hash />,
        description: "View category information",
    },
    {
        id: CATEGORY_SETTINGS_SECTION.PERMISSIONS,
        label: "Category Permissions",
        icon: <Users />,
        description: "Manage category permissions",
    },
    {
        id: CATEGORY_SETTINGS_SECTION.DELETION,
        label: "Delete Category",
        icon: <Trash2Icon />,
        description: "Permanently delete this category",
    },
] as const;

type GuildCategoryChannelSettingsContentProps = { guildId: string; channelId: string };

function GuildCategoryChannelSettingsContent({ channelId, guildId }: GuildCategoryChannelSettingsContentProps) {
    const [activeSection, setActiveSection] = React.useState<ValueOf<typeof CATEGORY_SETTINGS_SECTION>>(
        CATEGORY_SETTINGS_SECTION.OVERVIEW
    );
    const channel = useGuildCategoryChannel(guildId, channelId);
    return (
        <SettingsDialogContent
            onClose={closeGuildCategoryChannelSettings}
            title={channel.name}
            sidebar={
                <SettingsDialogSidebar
                    sidebarItems={sidebarItems}
                    activeSection={activeSection}
                    setActiveSection={setActiveSection}
                />
            }
        >
            {activeSection === CATEGORY_SETTINGS_SECTION.OVERVIEW && (
                <GuildCategoryChannelSettingsOverviewSection id={channel.id} name={channel.name} />
            )}
            {activeSection === CATEGORY_SETTINGS_SECTION.PERMISSIONS && (
                <GuildCategoryChannelSettingsPermissionsSection guildId={channel.guildId} id={channel.id} />
            )}
            {activeSection === CATEGORY_SETTINGS_SECTION.DELETION && (
                <GuildCategoryChannelSettingsDestructionSection id={channel.id} name={channel.name} />
            )}
        </SettingsDialogContent>
    );
}
