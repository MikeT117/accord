import type { ChannelMessageType } from "@/lib/types/types";
import { formatDistanceToNow } from "date-fns";
import { ChannelMessageContent } from "./channel-message-content";
import { ChannelMessageAttachment } from "./channel-message-attachment";
import { UserAvatar } from "../user-avatar";
import { openAttachmentGallery } from "@/lib/valtio/mutations/attachment-gallery-ui-store-mutations";
import { useDeleteChannelPinMutation } from "@/lib/react-query/mutations/delete-channel-pin-mutation";
import { XIcon } from "lucide-react";
import { DestructiveIconButton } from "../destructive-icon-button";

type PinnedChannelMessageProps = {
    message: ChannelMessageType;
    ref: (elem: HTMLDivElement | null) => void;
    canUnpinMessage: boolean;
};

export function PinnedChannelMessage({ ref, message, canUnpinMessage }: PinnedChannelMessageProps) {
    const { mutate: unpinMessage } = useDeleteChannelPinMutation();

    function handlePinMessage() {
        if (!canUnpinMessage) {
            return;
        }

        unpinMessage({ id: message.id, channelId: message.channelId });
    }

    function handleOpenAttachmentsGallery(startIndex: number) {
        openAttachmentGallery(startIndex, message.author, message.attachments);
    }

    return (
        <div className="group/pinned-message relative flex gap-4 rounded-md border px-4 py-2" ref={ref}>
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
                <ChannelMessageContent content={message.content} />
                {message.attachments.map((attachment, i) => (
                    <ChannelMessageAttachment
                        key={attachment.id}
                        attachment={attachment}
                        onClick={() => handleOpenAttachmentsGallery(i)}
                    />
                ))}
                <DestructiveIconButton
                    tooltipText="Unpin Message"
                    className="invisible absolute top-2 right-2 size-8 transition-all group-hover/pinned-message:visible"
                    onClick={handlePinMessage}
                    aria-label="Unpin Message"
                >
                    <XIcon />
                </DestructiveIconButton>
            </div>
        </div>
    );
}
