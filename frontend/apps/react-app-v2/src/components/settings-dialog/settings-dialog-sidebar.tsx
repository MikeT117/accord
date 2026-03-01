import type { JSX } from "react";
import { Sidebar, SidebarContent, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from "../ui/sidebar";

type SettingsDialogSidebarProps<T extends number> = {
    activeSection: T;
    setActiveSection: (section: T) => void;
    sidebarItems: ReadonlyArray<{
        id: T;
        label: string;
        icon: JSX.Element;
    }>;
};

export function SettingsDialogSidebar<T extends number>({
    activeSection,
    sidebarItems,
    setActiveSection,
}: SettingsDialogSidebarProps<T>) {
    return (
        <SidebarProvider>
            <Sidebar collapsible="none" className="bg-transparent">
                <SidebarContent className="gap-1">
                    {sidebarItems.map((item) => (
                        <SidebarMenuItem key={item.id}>
                            <SidebarMenuButton
                                size="lg"
                                isActive={activeSection === item.id}
                                onClick={() => setActiveSection(item.id)}
                            >
                                {item.icon}
                                {item.label}
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarContent>
            </Sidebar>
        </SidebarProvider>
    );
}
