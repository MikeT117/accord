import type { GuildRoleType } from "@/lib/types/types";
import { ArrowLeft, PlusIcon } from "lucide-react";
import { ButtonWithTooltip } from "../button-with-tooltip";
import { Button } from "../ui/button";
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
} from "../ui/sidebar";

type GuildSettingsRoleEditorSidebarProps = {
    roleId: string;
    roles: GuildRoleType[];
    onCreateRole: () => void;
    onRoleChange: (roleId: string | null) => void;
};

export function GuildSettingsRoleEditorSidebar({
    roleId,
    roles,
    onCreateRole,
    onRoleChange,
}: GuildSettingsRoleEditorSidebarProps) {
    return (
        <SidebarProvider className="max-w-[240px]">
            <Sidebar collapsible="none" className="border-r bg-transparent">
                <SidebarHeader className="mt-6 px-4">
                    <div className="flex items-center justify-between">
                        <Button variant="outline" size="sm" onClick={() => onRoleChange(null)}>
                            <ArrowLeft /> <span className="text-xs">Back</span>
                        </Button>
                        <ButtonWithTooltip
                            tooltipText="Create Role"
                            size="icon-sm"
                            variant="outline"
                            onClick={onCreateRole}
                        >
                            <PlusIcon />
                        </ButtonWithTooltip>
                    </div>
                </SidebarHeader>
                <SidebarContent className="mt-2 gap-1 px-4">
                    {roles.map((r) => (
                        <SidebarMenuItem className="list-none" key={r.id}>
                            <SidebarMenuButton isActive={roleId === r.id} onClick={() => onRoleChange(r.id)}>
                                {r.name}
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarContent>
            </Sidebar>
        </SidebarProvider>
    );
}
