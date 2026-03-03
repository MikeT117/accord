import * as React from "react";
import { FingerprintIcon, UserRoundPenIcon, CastleIcon, LayoutDashboardIcon, ShieldIcon } from "lucide-react";
import { Dialog, DialogClose } from "@/components/ui/dialog";
import type { ValueOf } from "@/lib/types/types";
import { SettingsDialogContent } from "../settings-dialog/settings-dialog-content";
import { SettingsDialogSidebar } from "../settings-dialog/settings-dialog-sidebar";
import { UserSettingsOverviewSection } from "./user-settings-section-overview";
import { UserSettingsPermissionsSection } from "./user-settings-section-permissions";
import { UserSettingsSessionsSection } from "./user-settings-section-sessions";
import { UserSettingsGuildsSection } from "./user-settings-section-guilds";
import { UserSettingsGuildProfileSection } from "./user-settings-section-guild-profile";
import { useUser } from "@/lib/zustand/stores/user-store";

const USER_SETTINGS_SECTION = {
    OVERVIEW: 0,
    PERMISSIONS: 1,
    SESSIONS: 2,
    GUILDS: 3,
    GUILD_PROFILES: 4,
} as const;

const sidebarItems = [
    {
        id: USER_SETTINGS_SECTION.OVERVIEW,
        label: "Overview",
        icon: <LayoutDashboardIcon />,
    },
    {
        id: USER_SETTINGS_SECTION.PERMISSIONS,
        label: "Permissions",
        icon: <ShieldIcon />,
    },
    {
        id: USER_SETTINGS_SECTION.SESSIONS,
        label: "Sessions",
        icon: <FingerprintIcon />,
    },
    {
        id: USER_SETTINGS_SECTION.GUILDS,
        label: "Guilds",
        icon: <CastleIcon />,
    },
    {
        id: USER_SETTINGS_SECTION.GUILD_PROFILES,
        label: "Guild Profile",
        icon: <UserRoundPenIcon />,
    },
] as const;

type UserSettingsDialogProps = { onClose: () => void };

export function UserSettingsDialog({ onClose }: UserSettingsDialogProps) {
    const [activeSection, setActiveSection] = React.useState<ValueOf<typeof USER_SETTINGS_SECTION>>(
        USER_SETTINGS_SECTION.OVERVIEW,
    );

    const user = useUser();
    return (
        <Dialog defaultOpen={true} onOpenChange={onClose}>
            <SettingsDialogContent
                onClose={onClose}
                title={user.displayName}
                sidebar={
                    <SettingsDialogSidebar
                        sidebarItems={sidebarItems}
                        activeSection={activeSection}
                        setActiveSection={setActiveSection}
                    />
                }
            >
                {activeSection === USER_SETTINGS_SECTION.OVERVIEW && (
                    <UserSettingsOverviewSection
                        userId={user.id}
                        displayName={user.displayName}
                        publicFlags={user.publicFlags}
                        avatar={user.avatar}
                        banner={user.banner}
                    />
                )}
                {activeSection === USER_SETTINGS_SECTION.PERMISSIONS && (
                    <UserSettingsPermissionsSection
                        userId={user.id}
                        displayName={user.displayName}
                        publicFlags={user.publicFlags}
                        avatar={user.avatar}
                        banner={user.banner}
                    />
                )}
                {activeSection === USER_SETTINGS_SECTION.SESSIONS && <UserSettingsSessionsSection />}
                {activeSection === USER_SETTINGS_SECTION.GUILDS && <UserSettingsGuildsSection userId={user.id} />}
                {activeSection === USER_SETTINGS_SECTION.GUILD_PROFILES && (
                    <UserSettingsGuildProfileSection userId={user.id} />
                )}
            </SettingsDialogContent>
        </Dialog>
    );
}
