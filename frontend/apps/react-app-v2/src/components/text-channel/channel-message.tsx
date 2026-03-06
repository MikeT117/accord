import type { ChannelMessageType } from "@/lib/types/types";
import { ChannelMessageContent } from "./channel-message-content";
import { AvatarWithFallback } from "../avatar-with-fallback";
import { useState } from "react";
import { ChannelMessageInlineEditor } from "./channel-message-inline-editor";
import { ButtonWithTooltip } from "../button-with-tooltip";
import { MoreHorizontalIcon, PinIcon, EditIcon, Trash2Icon } from "lucide-react";
import { Image } from "@/components/image";
import { ButtonGroup } from "../ui/button-group";
import { useParams } from "@tanstack/react-router";
import { ProfilePopover } from "../profile-popover";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Dialogs, dialogUIStoreActions } from "@/lib/zustand/stores/dialog-ui-store";
import { cn } from "@/lib/utils";
import { useRelativeTime } from "./hooks/use-relative-time";

type ChannelMessageProps = {
    message: ChannelMessageType;
    onDeleteMessage: (args: { id: string; channelId: string }) => void;
    onPinMessage: (args: { id: string; channelId: string }) => void;
    onUnpinMessage: (args: { id: string; channelId: string }) => void;
    forwardedRef: (elem: HTMLDivElement | null) => void;
    canDeleteMessage: boolean;
    canPinMessage: boolean;
    canEditMessage: boolean;
};

export function ChannelMessage({
    forwardedRef,
    message,
    canDeleteMessage,
    canPinMessage,
    canEditMessage,
    onDeleteMessage,
    onPinMessage,
    onUnpinMessage,
}: ChannelMessageProps) {
    const { guildId } = useParams({ strict: false });

    const [isEditing, setIsEditing] = useState(false);
    const [isMouseOver, setMouseOver] = useState(false);
    const [isDropdownOpen, setDropdownOpen] = useState(false);

    const relativeTimestamp = useRelativeTime(message.createdAt);

    const optionsVisible = isMouseOver || isDropdownOpen;

    function handlePinUnpinMessage() {
        if (!canPinMessage) {
            return;
        }

        if (message.pinned) {
            onUnpinMessage({ id: message.id, channelId: message.channelId });
            return;
        }

        onPinMessage({ id: message.id, channelId: message.channelId });
    }

    function handleDeleteMessage() {
        if (!canDeleteMessage) {
            return;
        }
        onDeleteMessage({ id: message.id, channelId: message.channelId });
    }

    function handleOpenAttachmentsGallery(startIndex: number) {
        dialogUIStoreActions.openDialog(Dialogs.AttachmentGallery, {
            attachments: message.attachments,
            author: message.author,
            initialIndex: startIndex,
        });
    }

    function toggleEditor() {
        if (!canEditMessage) {
            return;
        }

        setIsEditing((s) => !s);
    }

    function handleMouseEnter() {
        setMouseOver(true);
    }

    function handleMouseLeave() {
        setMouseOver(false);
    }

    return (
        <div
            ref={forwardedRef}
            className={`relative flex gap-4 px-4 py-2 transition-colors ${optionsVisible} ? "bg-accent/30": ""`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <AvatarWithFallback fallback={message.author.displayName} src={message.author.avatar} />
            <div className="flex w-full flex-col items-start space-y-2">
                <div className="mb-1 flex items-baseline gap-2">
                    <ProfilePopover userId={message.author.id} guildId={guildId}>
                        <a className="cursor-pointer text-sm font-medium text-foreground hover:underline">
                            {message.author.displayName}
                        </a>
                    </ProfilePopover>
                    <span className="text-xs text-muted-foreground">{relativeTimestamp}</span>
                </div>
                {isEditing ? (
                    <ChannelMessageInlineEditor message={message} onClose={toggleEditor} />
                ) : (
                    <ChannelMessageContent content={message.content} />
                )}
                {message.attachments.map((attachment, i) => (
                    <Image
                        className="max-h-[200px]"
                        key={attachment.id}
                        src={attachment.id}
                        onClick={() => handleOpenAttachmentsGallery(i)}
                        alt={attachment.filename}
                    />
                ))}
            </div>
            {optionsVisible && (
                <ButtonGroup className="absolute top-0 right-4">
                    <ButtonWithTooltip
                        variant="outline"
                        size="icon"
                        aria-label={message.pinned ? "Unpin Message" : "Pin Message"}
                        tooltipText={message.pinned ? "Unpin Message" : "Pin Message"}
                        onClick={handlePinUnpinMessage}
                    >
                        <PinIcon className={cn("rotate-45", message.pinned && "fill-black dark:fill-white")} />
                    </ButtonWithTooltip>
                    <ButtonWithTooltip
                        variant="outline"
                        size="icon"
                        tooltipText="Edit Message"
                        aria-label="Edit Message"
                        onClick={toggleEditor}
                    >
                        <EditIcon />
                    </ButtonWithTooltip>
                    <DropdownMenu open={isDropdownOpen} onOpenChange={setDropdownOpen}>
                        <DropdownMenuTrigger asChild>
                            <ButtonWithTooltip
                                aria-label="More Options"
                                variant="outline"
                                size="icon"
                                tooltipText="More Options"
                            >
                                <MoreHorizontalIcon />
                            </ButtonWithTooltip>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-42" align="end" sideOffset={8} side="bottom">
                            <DropdownMenuItem className="justify-between" onClick={toggleEditor}>
                                <span>Edit Message</span>
                                <EditIcon />
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {canPinMessage && (
                                <DropdownMenuItem className="justify-between" onClick={handlePinUnpinMessage}>
                                    <span>{message.pinned ? "Unpin" : "Pin"} Message</span>
                                    <PinIcon
                                        className={cn("rotate-45", message.pinned && "fill-black dark:fill-white")}
                                    />
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {canDeleteMessage && (
                                <DropdownMenuItem
                                    variant="destructive"
                                    className="justify-between"
                                    onClick={handleDeleteMessage}
                                >
                                    <span>Delete Message</span>
                                    <Trash2Icon />
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </ButtonGroup>
            )}
        </div>
    );
}
