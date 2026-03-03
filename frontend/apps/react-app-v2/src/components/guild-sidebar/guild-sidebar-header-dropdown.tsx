import { CogIcon, DoorOpenIcon, FolderPlusIcon, PlusCircleIcon, UserPlusIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteGuildMemberMutation } from "@/lib/react-query/mutations/delete-guild-member-mutation";
import { GuildRolePermissionsType } from "@/lib/types/types";
import { Dialogs, dialogUIStoreActions } from "@/lib/zustand/stores/dialog-ui-store";

type GuildSidebarHeaderDropdownProps = {
    guildId: string;
    creatorId: string;
    className?: string;
    children: ReactNode;
    currentUserId: string;
    permissions: GuildRolePermissionsType;
};

export function GuildSidebarHeaderDropdown({
    currentUserId,
    permissions,
    guildId,
    creatorId,
    children,
    className,
}: GuildSidebarHeaderDropdownProps) {
    const { mutate: leaveGuild } = useDeleteGuildMemberMutation();

    function handleLeaveGuildClick() {
        leaveGuild({ guildId, userId: currentUserId });
    }
    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                className={cn("group/guild-dropdown hover:bg-accent/5 data-[state=open]:bg-accent/5", className)}
            >
                {children}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48" align="center" side="bottom">
                {permissions.ManageGuildChannel && (
                    <DropdownMenuItem
                        className="justify-between"
                        onClick={() => dialogUIStoreActions.openDialog(Dialogs.CreateGuildChannel)}
                    >
                        Create Channel
                        <PlusCircleIcon />
                    </DropdownMenuItem>
                )}
                {permissions.ManageGuildChannel && (
                    <DropdownMenuItem
                        className="justify-between"
                        onClick={() => dialogUIStoreActions.openDialog(Dialogs.CreateGuildCategory)}
                    >
                        Create Category
                        <FolderPlusIcon />
                    </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {permissions.ManageGuild && (
                    <DropdownMenuItem
                        className="justify-between"
                        onClick={() => dialogUIStoreActions.openDialog(Dialogs.CreateGuildInvite)}
                    >
                        Invite People
                        <UserPlusIcon />
                    </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {permissions.ManageGuild && (
                    <DropdownMenuItem
                        onClick={() => dialogUIStoreActions.openDialog(Dialogs.GuildSettings)}
                        className="justify-between"
                    >
                        Guild Settings
                        <CogIcon />
                    </DropdownMenuItem>
                )}
                {creatorId !== currentUserId && (
                    <DropdownMenuItem variant="destructive" className="justify-between" onClick={handleLeaveGuildClick}>
                        Leave Guild
                        <DoorOpenIcon />
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
