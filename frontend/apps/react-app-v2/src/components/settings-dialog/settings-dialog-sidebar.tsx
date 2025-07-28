import type { JSX } from "react";
import { SettingsDialogSidebarItem } from "./settings-dialog-sidebar-item";

type SettingsDialogSidebarProps<T extends number> = {
    activeSection: T;
    sidebarItems: ReadonlyArray<{
        id: T;
        label: string;
        icon: JSX.Element;
        description: string;
    }>;
    setActiveSection: (section: T) => void;
};

export function SettingsDialogSidebar<T extends number>({
    activeSection,
    sidebarItems,
    setActiveSection,
}: SettingsDialogSidebarProps<T>) {
    return (
        <nav className="space-y-2">
            {sidebarItems.map((item) => (
                <SettingsDialogSidebarItem
                    key={item.id}
                    description={item.description}
                    icon={item.icon}
                    isActive={activeSection === item.id}
                    label={item.label}
                    onClick={() => setActiveSection(item.id)}
                />
            ))}
        </nav>
    );
}
