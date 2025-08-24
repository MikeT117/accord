import { Trash2Icon } from "lucide-react";
import { DestructiveIconButton } from "../destructive-icon-button";

type ChannelMessageCreatorAttachmentPreviewProps = { name: string; preview: string; onDelete: () => void };

export function ChannelMessageCreatorAttachmentPreview({
    name,
    preview,
    onDelete,
}: ChannelMessageCreatorAttachmentPreviewProps) {
    return (
        <div className="group relative flex h-full max-w-48 flex-col space-y-2 rounded-md border p-2">
            <div className="absolute -top-2 -right-2 rounded-md bg-background">
                <DestructiveIconButton
                    className="size-8"
                    onClick={onDelete}
                    tooltipText="Delete"
                    aria-label="Delete Attachment"
                >
                    <Trash2Icon />
                </DestructiveIconButton>
            </div>
            <div className="flex max-h-40 w-full justify-center self-center rounded-md bg-accent">
                <img src={preview} className="max-h-full rounded-md object-scale-down" />
            </div>
            <p className="truncate text-xs text-muted-foreground">{name}</p>
        </div>
    );
}
