import { useUserGuildPermissions } from "@/lib/authorisation/permissions";
import { openCreateGuildCategoryDialog } from "@/lib/valtio/mutations/create-guild-category-dialog-ui-store-mutations";
import { openCreateGuildChannelDialog } from "@/lib/valtio/mutations/create-guild-channel-dialog-ui-store-mutations";
import { openCreateGuildInviteDialog } from "@/lib/valtio/mutations/create-guild-invite-dialog-ui-store-mutations";
import { openGuildSettings } from "@/lib/valtio/mutations/guild-settings-ui-store-mutations";
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
import { useUser } from "@/lib/valtio/queries/user-store-queries";
import { useDeleteGuildMemberMutation } from "@/lib/react-query/mutations/delete-guild-member-mutation";

type GuildSidebarHeaderDropdownProps = { guildId: string; creatorId: string; className?: string; children: ReactNode };

export function GuildSidebarHeaderDropdown({
    guildId,
    creatorId,
    children,
    className,
}: GuildSidebarHeaderDropdownProps) {
    const { ManageGuild, ManageGuildChannel } = useUserGuildPermissions(guildId);
    const user = useUser();
    const { mutate: leaveGuild } = useDeleteGuildMemberMutation();

    function handleLeaveGuildClick() {
        if (creatorId === user.id) {
            return;
        }
        leaveGuild({ guildId, userId: user.id });
    }
    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                className={cn("group/guild-dropdown hover:bg-accent/5 data-[state=open]:bg-accent/5", className)}
            >
                {children}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48" align="center" side="bottom">
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
                {ManageGuild && (
                    <DropdownMenuItem className="justify-between" onClick={openCreateGuildInviteDialog}>
                        Invite People
                        <UserPlusIcon />
                    </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {ManageGuild && (
                    <DropdownMenuItem onClick={openGuildSettings} className="justify-between">
                        Guild Settings
                        <CogIcon />
                    </DropdownMenuItem>
                )}
                {creatorId !== user.id && (
                    <DropdownMenuItem variant="destructive" className="justify-between" onClick={handleLeaveGuildClick}>
                        Leave Guild
                        <DoorOpenIcon />
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
