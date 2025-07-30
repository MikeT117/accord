import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserGuildPermissions } from "@/lib/authorisation/permissions";
import { openCreateGuildCategoryDialog } from "@/lib/valtio/mutations/create-guild-category-dialog-ui-store-mutations";
import { openCreateGuildChannelDialog } from "@/lib/valtio/mutations/create-guild-channel-dialog-ui-store-mutations";
import {
    ChevronDownIcon,
    CogIcon,
    DoorOpenIcon,
    FolderPlusIcon,
    PlusCircleIcon,
    UserPlusIcon,
    XIcon,
} from "lucide-react";

type GuildSidebarHeaderDropdownProps = { id: string };

export function GuildSidebarHeaderDropdown({ id }: GuildSidebarHeaderDropdownProps) {
    const { hasManageGuild, hasManageGuildChannel } = useUserGuildPermissions(id);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="flex group/guild-dropdown items-center">
                <ChevronDownIcon size={20} className="group-data-[state=open]/guild-dropdown:hidden" />
                <XIcon size={20} className="group-data-[state=closed]/guild-dropdown:hidden" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48" align="end" sideOffset={8} alignOffset={-8} side="bottom">
                {hasManageGuildChannel && (
                    <DropdownMenuItem className="justify-between" onClick={openCreateGuildChannelDialog}>
                        Create Channel
                        <PlusCircleIcon />
                    </DropdownMenuItem>
                )}
                {hasManageGuildChannel && (
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
                {hasManageGuild && (
                    <DropdownMenuItem className="justify-between">
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
