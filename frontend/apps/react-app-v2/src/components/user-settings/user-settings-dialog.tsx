import * as React from "react";
import { Hash, Users, FingerprintIcon, ServerIcon } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import type { ValueOf } from "@/lib/types/types";
import { SettingsDialogContent } from "../settings-dialog/settings-dialog-content";
import { SettingsDialogSidebar } from "../settings-dialog/settings-dialog-sidebar";
import { useUser } from "@/lib/valtio/queries/user-store-queries";
import { useUserSettingsState } from "@/lib/valtio/queries/user-settings-ui-store-queries";
import { closeUserSettings } from "@/lib/valtio/mutations/user-settings-ui-store-mutations";
import { UserSettingsOverviewSection } from "./user-settings-section-overview";
import { UserSettingsPermissionsSection } from "./user-settings-section-permissions";
import { UserSettingsSessionsSection } from "./user-settings-section-sessions";
import { UserSettingsGuildsSection } from "./user-settings-section-guilds";

export function UserSettings() {
    const { isOpen } = useUserSettingsState();
    return (
        <Dialog open={isOpen} onOpenChange={closeUserSettings}>
            {isOpen && <UserSettingsContent />}
        </Dialog>
    );
}

const USER_SETTINGS_SECTION = {
    OVERVIEW: 0,
    PERMISSIONS: 1,
    SESSIONS: 2,
    GUILDS: 3,
} as const;

const sidebarItems = [
    {
        id: USER_SETTINGS_SECTION.OVERVIEW,
        label: "Account Overview",
        icon: <Hash />,
        description: "View account information",
    },
    {
        id: USER_SETTINGS_SECTION.PERMISSIONS,
        label: "Account Permissions",
        icon: <Users />,
        description: "Manage account permissions",
    },
    {
        id: USER_SETTINGS_SECTION.SESSIONS,
        label: "Sessions",
        icon: <FingerprintIcon />,
        description: "Manage account sessions",
    },
    {
        id: USER_SETTINGS_SECTION.GUILDS,
        label: "Servers",
        icon: <ServerIcon />,
        description: "Manage server memberships",
    },
] as const;

function UserSettingsContent() {
    const [activeSection, setActiveSection] = React.useState<ValueOf<typeof USER_SETTINGS_SECTION>>(
        USER_SETTINGS_SECTION.OVERVIEW
    );
    const user = useUser();

    return (
        <SettingsDialogContent
            onClose={closeUserSettings}
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
                    displayName={user.displayName}
                    publicFlags={user.publicFlags}
                    avatar={user.avatar}
                    banner={user.banner}
                />
            )}
            {activeSection === USER_SETTINGS_SECTION.PERMISSIONS && (
                <UserSettingsPermissionsSection
                    displayName={user.displayName}
                    publicFlags={user.publicFlags}
                    avatar={user.avatar}
                    banner={user.banner}
                />
            )}
            {activeSection === USER_SETTINGS_SECTION.SESSIONS && <UserSettingsSessionsSection />}
            {activeSection === USER_SETTINGS_SECTION.GUILDS && <UserSettingsGuildsSection />}
        </SettingsDialogContent>
    );
}
