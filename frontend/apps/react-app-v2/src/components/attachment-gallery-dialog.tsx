import { Dialog, DialogContent } from "./ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ChevronLeft, ChevronRight, XIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AvatarWithFallback } from "./avatar-with-fallback";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import { Image } from "@/components/image";
import { ButtonWithTooltip } from "./button-with-tooltip";
import { AttachmentType, UserType } from "@/lib/types/types";
import { useState } from "react";
import { cn } from "@/lib/utils";

type AttachmentGalleryDialogProps = {
    onClose: () => void;
    initialIndex: number;
    attachments: AttachmentType[];
    author: UserType;
};

export function AttachmentGalleryDialog({ onClose, initialIndex, attachments, author }: AttachmentGalleryDialogProps) {
    const [index, setIndex] = useState(initialIndex);

    function incrementIndex() {
        setIndex((s) => (s + 1) % attachments.length);
    }

    function decrementIndex() {
        setIndex((s) => (s - 1 + attachments.length) % attachments.length);
    }

    function goToIndex(idx: number) {
        setIndex(idx);
    }

    useKeyboardShortcut({ handler: incrementIndex, key: "ArrowRight" });
    useKeyboardShortcut({ handler: decrementIndex, key: "ArrowLeft" });
    const displayButtons = attachments.length > 1;

    return (
        <Dialog defaultOpen={true} onOpenChange={onClose} modal>
            <DialogContent
                showCloseButton={false}
                className="flex h-screen flex-col justify-between overflow-hidden border-none bg-transparent px-6 py-8 md:max-h-screen md:max-w-screen lg:max-w-screen"
            >
                <VisuallyHidden>
                    <DialogTitle>Attachment Gallery</DialogTitle>
                </VisuallyHidden>
                <div className="flex w-full justify-between">
                    <div className="flex items-center space-x-2">
                        <AvatarWithFallback size="xl" fallback={author.displayName} src={author.avatar} />
                        <div className="flex flex-col items-baseline">
                            <span className="cursor-pointer font-medium text-foreground hover:underline">
                                {author.displayName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(attachments[0].createdAt, { addSuffix: true })}
                            </span>
                        </div>
                    </div>
                    <ButtonWithTooltip tooltipText="Close" variant="outline" size="icon" onClick={onClose}>
                        <XIcon />
                    </ButtonWithTooltip>
                </div>
                <div className="flex w-full  items-center justify-between space-x-8 overflow-hidden">
                    {displayButtons && (
                        <ButtonWithTooltip
                            tooltipText="Previous Image"
                            size="icon"
                            variant="outline"
                            onClick={decrementIndex}
                        >
                            <ChevronLeft />
                        </ButtonWithTooltip>
                    )}
                    <Image
                        className="h-full w-full rounded-md object-scale-down"
                        src={attachments[index].id}
                        alt={attachments[index].filename}
                    />
                    {displayButtons && (
                        <ButtonWithTooltip
                            tooltipText="Next Image"
                            size="icon"
                            variant="outline"
                            onClick={incrementIndex}
                        >
                            <ChevronRight />
                        </ButtonWithTooltip>
                    )}
                </div>
                <div className="mx-auto flex h-10 shrink-0 space-x-0.5 overflow-hidden rounded-md">
                    {attachments.map((attachment, i) => (
                        <Image
                            key={attachment.id}
                            onClick={() => goToIndex(i)}
                            className={cn("image flex max-w-18", index !== i && "opacity-30")}
                            alt={attachment.filename}
                            src={attachment.id}
                        />
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
