import { ServerIcon, LockKeyholeIcon, UsersIcon, MailOpenIcon, BanIcon } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import type { ValueOf } from "@/lib/types/types";
import { useGuild } from "@/lib/valtio/queries/guild-store-queries";
import { SettingsDialogContent } from "../settings-dialog/settings-dialog-content";
import { SettingsDialogSidebar } from "../settings-dialog/settings-dialog-sidebar";
import { useGuildSettingsState } from "@/lib/valtio/queries/guild-settings-ui-store-queries";
import { closeGuildSettings } from "@/lib/valtio/mutations/guild-settings-ui-store-mutations";
import { useParams } from "@tanstack/react-router";
import { useState } from "react";
import { GuildSettingsOverviewSection } from "./guild-settings-section-overview";
import { GuildSettingsRolesSection } from "./guild-settings-section-roles";
import { GuildSettingsMembersSection } from "./guild-settings-section-members";
import { GuildSettingsInvitesSection } from "./guild-settings-section-invites";
import { GuildSettingsBansSection } from "./guild-settings-section-bans";
import { GuildSettingsDestructionSection } from "./guild-settings-section-destruction";

export function GuildSettings() {
    const { isOpen } = useGuildSettingsState();
    const { guildId } = useParams({ from: "/_auth/app/$guildId" });
    return (
        <Dialog open={isOpen} onOpenChange={closeGuildSettings}>
            {isOpen && <GuildSettingsContent guildId={guildId} />}
        </Dialog>
    );
}

const GUILD_SETTINGS_SECTION = {
    GUILD_OVERVIEW: 0,
    GUILD_ROLES: 1,
    GUILD_MEMBERS: 2,
    GUILD_INVITES: 3,
    GUILD_BANS: 4,
    GUILD_DELETION: 5,
} as const;

const sidebarItems = [
    {
        id: GUILD_SETTINGS_SECTION.GUILD_OVERVIEW,
        label: "Server Overview",
        icon: <ServerIcon />,
        description: "View/Edit Server information",
    },
    {
        id: GUILD_SETTINGS_SECTION.GUILD_ROLES,
        label: "Server Roles",
        icon: <LockKeyholeIcon />,
        description: "Manage server roles",
    },
    {
        id: GUILD_SETTINGS_SECTION.GUILD_MEMBERS,
        label: "Server Members",
        icon: <UsersIcon />,
        description: "Manage server members",
    },
    {
        id: GUILD_SETTINGS_SECTION.GUILD_INVITES,
        label: "Server Invites",
        icon: <MailOpenIcon />,
        description: "Manage server invites",
    },
    {
        id: GUILD_SETTINGS_SECTION.GUILD_BANS,
        label: "Server Bans",
        icon: <BanIcon />,
        description: "Manage server bans",
    },
    {
        id: GUILD_SETTINGS_SECTION.GUILD_DELETION,
        label: "Delete Server",
        icon: <BanIcon />,
        description: "Manage server bans",
    },
] as const;

type GuildSettingsContentProps = { guildId: string };

function GuildSettingsContent({ guildId }: GuildSettingsContentProps) {
    const [activeSection, setActiveSection] = useState<ValueOf<typeof GUILD_SETTINGS_SECTION>>(
        GUILD_SETTINGS_SECTION.GUILD_OVERVIEW,
    );
    const guild = useGuild(guildId);
    return (
        <SettingsDialogContent
            onClose={closeGuildSettings}
            title={guild.name}
            sidebar={
                <SettingsDialogSidebar
                    sidebarItems={sidebarItems}
                    activeSection={activeSection}
                    setActiveSection={setActiveSection}
                />
            }
        >
            {activeSection === GUILD_SETTINGS_SECTION.GUILD_OVERVIEW && <GuildSettingsOverviewSection guild={guild} />}
            {activeSection === GUILD_SETTINGS_SECTION.GUILD_ROLES && <GuildSettingsRolesSection guildId={guildId} />}
            {activeSection === GUILD_SETTINGS_SECTION.GUILD_MEMBERS && (
                <GuildSettingsMembersSection guildId={guild.id} />
            )}
            {activeSection === GUILD_SETTINGS_SECTION.GUILD_INVITES && (
                <GuildSettingsInvitesSection guildId={guild.id} />
            )}
            {activeSection === GUILD_SETTINGS_SECTION.GUILD_BANS && <GuildSettingsBansSection guildId={guild.id} />}

            {activeSection === GUILD_SETTINGS_SECTION.GUILD_DELETION && (
                <GuildSettingsDestructionSection guildId={guild.id} name={guild.name} />
            )}
        </SettingsDialogContent>
    );
}
