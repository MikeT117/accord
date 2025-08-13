import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserGuildPermissions } from "@/lib/authorisation/permissions";
import { cn } from "@/lib/utils";
import { openCreateGuildCategoryDialog } from "@/lib/valtio/mutations/create-guild-category-dialog-ui-store-mutations";
import { openCreateGuildChannelDialog } from "@/lib/valtio/mutations/create-guild-channel-dialog-ui-store-mutations";
import { openGuildSettings } from "@/lib/valtio/mutations/guild-settings-ui-store-mutations";

import { CogIcon, DoorOpenIcon, FolderPlusIcon, PlusCircleIcon, UserPlusIcon } from "lucide-react";
import type { ReactNode } from "react";

type GuildSidebarHeaderDropdownProps = { id: string; className?: string; children: ReactNode };

export function GuildSidebarHeaderDropdown({ id, children, className }: GuildSidebarHeaderDropdownProps) {
    const { ManageGuild, ManageGuildChannel } = useUserGuildPermissions(id);
    return (
        <DropdownMenu>
            <DropdownMenuTrigger className={cn("group/guild-dropdown hover:bg-accent", className)}>
                {children}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48" align="end" sideOffset={8} alignOffset={-8} side="bottom">
                {ManageGuildChannel && (
                    <DropdownMenuItem className="justify-between" onClick={openCreateGuildChannelDialog}>
                        Create Channel
                        <PlusCircleIcon />
                    </DropdownMenuItem>
                )}
                {ManageGuildChannel && (
                    <DropdownMenuItem className="justify-between" onClick={openCreateGuildCategoryDialog}>
                        Create Category
                        <FolderPlusIcon />
                    </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-between">
                    Invite People
                    <UserPlusIcon />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {ManageGuild && (
                    <DropdownMenuItem onClick={openGuildSettings} className="justify-between">
                        Server Settings
                        <CogIcon />
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem variant="destructive" className="justify-between">
                    Leave Server
                    <DoorOpenIcon />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
