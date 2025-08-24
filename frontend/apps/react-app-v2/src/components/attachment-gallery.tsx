import {
    closeAttachmentGallery,
    decrementAttachmentGalleryIndex,
    incrementAttachmentGalleryIndex,
    setAttachmentGalleryIndex,
} from "@/lib/valtio/mutations/attachment-gallery-ui-store-mutations";
import { Dialog, DialogContent } from "./ui/dialog";
import { useAttachmentGalleryUIState } from "@/lib/valtio/queries/attachment-gallery-ui-store-queries";
import { env } from "@/lib/constants";
import { DialogTitle } from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, XIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { UserAvatar } from "./user-avatar";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";

export function AttachmentGallery() {
    const { isOpen, index, attachments, author } = useAttachmentGalleryUIState();
    useKeyboardShortcut({ handler: incrementAttachmentGalleryIndex, key: "ArrowRight", enabled: isOpen });
    useKeyboardShortcut({ handler: decrementAttachmentGalleryIndex, key: "ArrowLeft", enabled: isOpen });

    return (
        <Dialog open={isOpen} onOpenChange={closeAttachmentGallery} modal>
            <DialogContent
                showCloseButton={false}
                className="flex h-screen flex-col justify-between overflow-hidden border-none bg-transparent px-6 py-8 md:max-h-screen md:max-w-screen lg:max-w-screen"
            >
                {/* This is required despite DialogContent unmounting it's children due to the state being wiped when closing*/}
                {isOpen && (
                    <>
                        <VisuallyHidden>
                            <DialogTitle>Attachment Gallery</DialogTitle>
                        </VisuallyHidden>
                        <div className="flex w-full justify-between">
                            <div className="flex items-center space-x-2">
                                <UserAvatar
                                    className="size-12 border-none"
                                    displayName={author.displayName}
                                    avatar={author.avatar}
                                />
                                <div className="flex flex-col items-baseline">
                                    <span className="cursor-pointer font-medium text-foreground hover:underline">
                                        {author.displayName}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(attachments[0].createdAt, { addSuffix: true })}
                                    </span>
                                </div>
                            </div>
                            <Button variant="outline" size="icon" onClick={closeAttachmentGallery}>
                                <XIcon />
                            </Button>
                        </div>
                        <div className="flex w-full  items-center justify-between space-x-8 overflow-hidden">
                            <Button size="icon" variant="outline" onClick={decrementAttachmentGalleryIndex}>
                                <ChevronLeft />
                            </Button>
                            <img
                                className="h-full rounded-md object-scale-down"
                                src={`${env.CLOUDINARY_RES_URL}/${attachments[index].id}`}
                            />
                            <Button size="icon" variant="outline" onClick={incrementAttachmentGalleryIndex}>
                                <ChevronRight />
                            </Button>
                        </div>
                        <div className="mx-auto flex h-10 shrink-0 space-x-0.5 overflow-hidden rounded-md">
                            {attachments.map((attachment, i) => (
                                <img
                                    key={attachment.id}
                                    onClick={() => setAttachmentGalleryIndex(i)}
                                    className={index !== i ? "opacity-30" : ""}
                                    src={`${env.CLOUDINARY_RES_URL}/${attachment.id}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
