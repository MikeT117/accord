import { UsersIcon, MailOpenIcon, CircleOffIcon, Trash2Icon, ShieldIcon, LayoutDashboardIcon } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import type { ValueOf } from "@/lib/types/types";
import { SettingsDialogContent } from "../settings-dialog/settings-dialog-content";
import { SettingsDialogSidebar } from "../settings-dialog/settings-dialog-sidebar";
import { useParams } from "@tanstack/react-router";
import { useState } from "react";
import { GuildSettingsOverviewSection } from "./guild-settings-section-overview";
import { GuildSettingsRolesSection } from "./guild-settings-section-roles";
import { GuildSettingsMembersSection } from "./guild-settings-section-members";
import { GuildSettingsInvitesSection } from "./guild-settings-section-invites";
import { GuildSettingsBansSection } from "./guild-settings-section-bans";
import { GuildSettingsDestructionSection } from "./guild-settings-section-destruction";
import { useGuild } from "@/lib/zustand/stores/guild-store";

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
        label: "Overview",
        icon: <LayoutDashboardIcon />,
    },
    {
        id: GUILD_SETTINGS_SECTION.GUILD_ROLES,
        label: "Roles",
        icon: <ShieldIcon />,
    },
    {
        id: GUILD_SETTINGS_SECTION.GUILD_MEMBERS,
        label: "Members",
        icon: <UsersIcon />,
    },
    {
        id: GUILD_SETTINGS_SECTION.GUILD_INVITES,
        label: "Invites",
        icon: <MailOpenIcon />,
    },
    {
        id: GUILD_SETTINGS_SECTION.GUILD_BANS,
        label: "Bans",
        icon: <CircleOffIcon />,
    },
    {
        id: GUILD_SETTINGS_SECTION.GUILD_DELETION,
        label: "Delete",
        icon: <Trash2Icon />,
    },
] as const;

type GuildSettingsDialogProps = { onClose: () => void };

export function GuildSettingsDialog({ onClose }: GuildSettingsDialogProps) {
    const { guildId } = useParams({ from: "/_auth/app/$guildId" });
    const guild = useGuild(guildId);
    const [activeSection, setActiveSection] = useState<ValueOf<typeof GUILD_SETTINGS_SECTION>>(
        GUILD_SETTINGS_SECTION.GUILD_OVERVIEW,
    );
    return (
        <Dialog defaultOpen={true} onOpenChange={onClose}>
            <SettingsDialogContent
                onClose={onClose}
                title={guild.name}
                sidebar={
                    <SettingsDialogSidebar
                        sidebarItems={sidebarItems}
                        activeSection={activeSection}
                        setActiveSection={setActiveSection}
                    />
                }
            >
                {activeSection === GUILD_SETTINGS_SECTION.GUILD_OVERVIEW && (
                    <GuildSettingsOverviewSection guild={guild} />
                )}
                {activeSection === GUILD_SETTINGS_SECTION.GUILD_ROLES && (
                    <GuildSettingsRolesSection guildId={guildId} />
                )}
                {activeSection === GUILD_SETTINGS_SECTION.GUILD_MEMBERS && (
                    <GuildSettingsMembersSection guildId={guild.id} />
                )}
                {activeSection === GUILD_SETTINGS_SECTION.GUILD_INVITES && (
                    <GuildSettingsInvitesSection guildId={guild.id} />
                )}
                {activeSection === GUILD_SETTINGS_SECTION.GUILD_BANS && <GuildSettingsBansSection guildId={guild.id} />}

                {activeSection === GUILD_SETTINGS_SECTION.GUILD_DELETION && (
                    <GuildSettingsDestructionSection guildId={guild.id} name={guild.name} onClose={onClose} />
                )}
            </SettingsDialogContent>
        </Dialog>
    );
}
