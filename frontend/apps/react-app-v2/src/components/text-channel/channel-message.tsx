import type { ChannelMessageType } from "@/lib/types/types";
import { formatDistanceToNow } from "date-fns";
import { ChannelMessageContent } from "./channel-message-content";
import { ChannelMessageAttachment } from "./channel-message-attachment";
import { UserAvatar } from "../user-avatar";
import { useState } from "react";
import { openAttachmentGallery } from "@/lib/valtio/mutations/attachment-gallery-ui-store-mutations";
import { ChannelMessageInlineEditor } from "./channel-message-inline-editor";
import { ButtonWithTooltip } from "../button-with-tooltip";
import { PencilIcon, MoreHorizontalIcon, PinIcon, PinOffIcon, Trash2Icon } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";

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
    const [isEditing, setIsEditing] = useState(false);
    const [isMouseOver, setMouseOver] = useState(false);
    const [isDropdownOpen, setDropdownOpen] = useState(false);

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
        openAttachmentGallery(startIndex, message.author, message.attachments);
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
            <UserAvatar
                className="size-10 border-none"
                displayName={message.author.displayName}
                avatar={message.author.avatar}
            />
            <div className="flex w-full flex-col items-start space-y-2">
                <div className="mb-1 flex items-baseline gap-2">
                    <span className="cursor-pointer font-medium text-foreground hover:underline">
                        {message.author.displayName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(message.createdAt, {
                            addSuffix: true,
                        })}
                    </span>
                </div>
                {isEditing ? (
                    <ChannelMessageInlineEditor message={message} onClose={toggleEditor} />
                ) : (
                    <ChannelMessageContent content={message.content} />
                )}
                {message.attachments.map((attachment, i) => (
                    <ChannelMessageAttachment
                        key={attachment.id}
                        attachment={attachment}
                        onClick={() => handleOpenAttachmentsGallery(i)}
                    />
                ))}
            </div>
            {optionsVisible && (
                <div className="absolute top-0 right-4 flex rounded-lg border bg-background p-0.5 shadow-sm">
                    <ButtonWithTooltip
                        aria-label={message.pinned ? "Unpin Message" : "Pin Message"}
                        variant="ghost"
                        size="sm"
                        className="size-8"
                        tooltipText={message.pinned ? "Unpin Message" : "Pin Message"}
                        onClick={handlePinUnpinMessage}
                    >
                        {message.pinned ? <PinOffIcon /> : <PinIcon />}
                    </ButtonWithTooltip>
                    {canEditMessage && (
                        <ButtonWithTooltip
                            aria-label="Edit Message"
                            variant="ghost"
                            size="sm"
                            className="size-8"
                            tooltipText="Edit Message"
                            onClick={toggleEditor}
                        >
                            <PencilIcon />
                        </ButtonWithTooltip>
                    )}
                    <DropdownMenu open={isDropdownOpen} onOpenChange={setDropdownOpen}>
                        <DropdownMenuTrigger asChild>
                            <ButtonWithTooltip
                                aria-label="More Options"
                                variant="ghost"
                                size="sm"
                                className="size-8 data-[state=open]:bg-accent dark:data-[state=open]:bg-accent/50"
                                tooltipText="More Options"
                            >
                                <MoreHorizontalIcon />
                            </ButtonWithTooltip>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-48" align="end" sideOffset={8} side="bottom">
                            <DropdownMenuItem className="justify-between" onClick={toggleEditor}>
                                Edit Message
                                <PencilIcon />
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {canPinMessage && (
                                <DropdownMenuItem className="justify-between" onClick={handlePinUnpinMessage}>
                                    {message.pinned ? "Unpin Message" : "Pin Message"}
                                    {message.pinned ? <PinOffIcon /> : <PinIcon />}
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {canDeleteMessage && (
                                <DropdownMenuItem
                                    variant="destructive"
                                    className="justify-between"
                                    onClick={handleDeleteMessage}
                                >
                                    Delete Message
                                    <Trash2Icon />
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}
        </div>
    );
}
