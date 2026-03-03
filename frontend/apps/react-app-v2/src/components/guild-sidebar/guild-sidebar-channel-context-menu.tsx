import {
    ContextMenu,
    ContextMenuTrigger,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
} from "@/components/ui/context-menu";
import type { GuildChannelType, GuildRolePermissionsType } from "@/lib/types/types";
import { GUILD_CHANNEL_TYPE } from "@/lib/zod-validation/channel-schema";
import type { ReactNode } from "react";
import { useDeleteChannelMutation } from "@/lib/react-query/mutations/delete-channel-mutation";
import { Dialogs, dialogUIStoreActions } from "@/lib/zustand/stores/dialog-ui-store";

type ChannelSidebarChannelContextMenuProps = {
    children: ReactNode;
} & Pick<GuildChannelType, "channelType" | "id" | "guildId" | "name"> & {
        permissions: GuildRolePermissionsType;
    };

export function GuildSidebarChannelContextMenu({
    id,
    guildId,
    name,
    channelType,
    permissions,
    children,
}: ChannelSidebarChannelContextMenuProps) {
    const { mutate: deleteChannel } = useDeleteChannelMutation();
    const isGuildCategoryChannel = channelType === GUILD_CHANNEL_TYPE.GUILD_CATEGORY_CHANNEL;

    function handleDeleteClick() {
        dialogUIStoreActions.openDialog(Dialogs.ConfirmDeleteAction, {
            actionFn: () => deleteChannel({ id }),
        });
    }

    function handleEditClick() {
        dialogUIStoreActions.openDialog(Dialogs.ChannelSettings, { channelId: id, guildId });
    }

    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
            <ContextMenuContent className="w-40">
                {permissions.ManageGuildChannel && (
                    <ContextMenuItem onClick={handleEditClick}>
                        Edit {isGuildCategoryChannel ? "Category" : "Channel"}
                    </ContextMenuItem>
                )}
                <ContextMenuSeparator />
                {permissions.ManageGuildChannel && (
                    <ContextMenuItem variant="destructive" onClick={handleDeleteClick}>
                        Delete
                    </ContextMenuItem>
                )}
            </ContextMenuContent>
        </ContextMenu>
    );
}
