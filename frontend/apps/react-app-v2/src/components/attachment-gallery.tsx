import {
    closeAttachmentGallery,
    decrementAttachmentGalleryIndex,
    incrementAttachmentGalleryIndex,
    setAttachmentGalleryIndex,
} from "@/lib/valtio/mutations/attachment-gallery-ui-store-mutations";
import { Dialog, DialogContent } from "./ui/dialog";
import { useAttachmentGalleryUIState } from "@/lib/valtio/queries/attachment-gallery-ui-store-queries";
import { DialogTitle } from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ChevronLeft, ChevronRight, XIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AvatarWithFallback } from "./avatar-with-fallback";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import { Image } from "@/components/image";
import clsx from "clsx";
import { ButtonWithTooltip } from "./button-with-tooltip";

export function AttachmentGallery() {
    const { isOpen, index, attachments, author } = useAttachmentGalleryUIState();
    useKeyboardShortcut({ handler: incrementAttachmentGalleryIndex, key: "ArrowRight", enabled: isOpen });
    useKeyboardShortcut({ handler: decrementAttachmentGalleryIndex, key: "ArrowLeft", enabled: isOpen });
    const displayButtons = attachments.length > 1;

    return (
        <Dialog open={isOpen} onOpenChange={closeAttachmentGallery} modal>
            <DialogContent
                showCloseButton={false}
                className="flex h-screen flex-col justify-between overflow-hidden border-none bg-transparent px-6 py-8 md:max-h-screen md:max-w-screen lg:max-w-screen"
            >
                {isOpen && (
                    <>
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
                            <ButtonWithTooltip
                                tooltipText="Close"
                                variant="outline"
                                size="icon"
                                onClick={closeAttachmentGallery}
                            >
                                <XIcon />
                            </ButtonWithTooltip>
                        </div>
                        <div className="flex w-full  items-center justify-between space-x-8 overflow-hidden">
                            {displayButtons && (
                                <ButtonWithTooltip
                                    tooltipText="Previous Image"
                                    size="icon"
                                    variant="outline"
                                    onClick={decrementAttachmentGalleryIndex}
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
                                    onClick={incrementAttachmentGalleryIndex}
                                >
                                    <ChevronRight />
                                </ButtonWithTooltip>
                            )}
                        </div>
                        <div className="mx-auto flex h-10 shrink-0 space-x-0.5 overflow-hidden rounded-md">
                            {attachments.map((attachment, i) => (
                                <Image
                                    key={attachment.id}
                                    onClick={() => setAttachmentGalleryIndex(i)}
                                    className={clsx("image flex max-w-18", index !== i && "opacity-30")}
                                    alt={attachment.filename}
                                    src={attachment.id}
                                />
                            ))}
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
