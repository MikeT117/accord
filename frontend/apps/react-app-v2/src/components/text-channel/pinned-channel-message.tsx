import type { ChannelMessageType } from "@/lib/types/types";
import { formatDistanceToNow } from "date-fns";
import { ChannelMessageContent } from "./channel-message-content";
import { Image } from "@/components/image";
import { AvatarWithFallback } from "../avatar-with-fallback";
import { useDeleteChannelPinMutation } from "@/lib/react-query/mutations/delete-channel-pin-mutation";
import { PinIcon } from "lucide-react";
import { ButtonWithTooltip } from "../button-with-tooltip";
import { dialogUIStoreActions, Dialogs } from "@/lib/zustand/stores/dialog-ui-store";

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
        dialogUIStoreActions.openDialog(Dialogs.AttachmentGallery, {
            attachments: message.attachments,
            author: message.author,
            initialIndex: startIndex,
        });
    }

    return (
        <div
            className="group/pinned-message relative flex gap-4 rounded-md border border-border bg-background px-4 py-2 transition-all hover:bg-muted hover:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50"
            ref={ref}
        >
            <AvatarWithFallback fallback={message.author.displayName} src={message.author.avatar} />
            <div className="flex w-full flex-col items-start gap-y-2">
                <div className="mb-1 flex items-baseline gap-x-2">
                    <span className="cursor-pointer font-medium text-foreground">{message.author.displayName}</span>
                    <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(message.createdAt, {
                            addSuffix: true,
                        })}
                    </span>
                </div>
                <ChannelMessageContent content={message.content} />
                {message.attachments.map((attachment, i) => (
                    <Image
                        key={attachment.id}
                        className="max-h-[80px]"
                        src={attachment.id}
                        onClick={() => handleOpenAttachmentsGallery(i)}
                        alt={attachment.filename}
                    />
                ))}
                <ButtonWithTooltip
                    variant="destructive"
                    size="icon-sm"
                    tooltipText="Unpin Message"
                    className="invisible absolute top-2 right-2 transition-all group-hover/pinned-message:visible"
                    onClick={handlePinMessage}
                    aria-label="Unpin Message"
                >
                    <PinIcon className="rotate-45" />
                </ButtonWithTooltip>
            </div>
        </div>
    );
}
