import {
    ContextMenu,
    ContextMenuTrigger,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { useGuildChannelPermissions } from "@/lib/authorisation/permissions";
import type { GuildChannelType } from "@/lib/types/types";
import { GUILD_CHANNEL_TYPE } from "@/lib/zod-validation/channel-schema";
import type { ReactNode } from "react";
import { useDeleteChannelMutation } from "@/lib/react-query/mutations/delete-channel-mutation";
import { useClipboard } from "@/hooks/use-clipboard";
import {
    closeConfirmActionDialog,
    openConfirmDeleteChannelActionDialog,
} from "@/lib/valtio/mutations/confirm-action-dialog-ui-store-mutations";

type ChannelSidebarChannelContextMenuPropsType = {
    children: ReactNode;
} & Pick<GuildChannelType, "channelType" | "id" | "guildId" | "name">;

export function GuildSidebarChannelContextMenu({
    id,
    guildId,
    name,
    channelType,
    children,
}: ChannelSidebarChannelContextMenuPropsType) {
    const { onCopy } = useClipboard();
    const { hasManageGuildChannel } = useGuildChannelPermissions(guildId, id);
    const { mutate: deleteChannel } = useDeleteChannelMutation({ onSuccess: closeConfirmActionDialog });

    // const isGuildTextChannel = channelType === GUILD_CHANNEL_TYPE.GUILD_TEXT_CHANNEL;
    const isGuildCategoryChannel = channelType === GUILD_CHANNEL_TYPE.GUILD_CATEGORY_CHANNEL;
    // const isGuildVoiceChannel = channelType === GUILD_CHANNEL_TYPE.GUILD_VOICE_CHANNEL;

    function handleDeleteClick() {
        openConfirmDeleteChannelActionDialog(name, () => deleteChannel({ id }));
    }

    function handleCopyLinkClick() {
        onCopy(`${window.location.origin}/app/${guildId}/${id}`);
    }

    return (
        <ContextMenu>
            <ContextMenuTrigger>{children}</ContextMenuTrigger>
            <ContextMenuContent className="w-40">
                {!isGuildCategoryChannel && <ContextMenuItem>Mute Channel</ContextMenuItem>}
                <ContextMenuItem onClick={handleCopyLinkClick}>Copy Link</ContextMenuItem>
                <ContextMenuSeparator />
                {hasManageGuildChannel && (
                    <ContextMenuItem>Edit {isGuildCategoryChannel ? "Category" : "Channel"}</ContextMenuItem>
                )}
                {hasManageGuildChannel && (
                    <ContextMenuItem variant="destructive" onClick={handleDeleteClick}>
                        Delete
                    </ContextMenuItem>
                )}
            </ContextMenuContent>
        </ContextMenu>
    );
}
