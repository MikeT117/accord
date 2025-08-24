import type { AttachmentType, UserType } from "@/lib/types/types";
import { attachmentGalleryUIStore } from "../stores/attachment-gallery-ui-store";

export function openAttachmentGallery(startingIndex: number, author: UserType, attachments: AttachmentType[]) {
    attachmentGalleryUIStore.isOpen = true;
    attachmentGalleryUIStore.index = startingIndex;
    attachmentGalleryUIStore.author = author;
    attachmentGalleryUIStore.attachments = attachments;
}

export function closeAttachmentGallery() {
    attachmentGalleryUIStore.isOpen = false;
    attachmentGalleryUIStore.attachments = [];
    attachmentGalleryUIStore.index = 0;
    attachmentGalleryUIStore.author = null;
}

export function incrementAttachmentGalleryIndex() {
    attachmentGalleryUIStore.index = (attachmentGalleryUIStore.index + 1) % attachmentGalleryUIStore.attachments.length;
}

export function decrementAttachmentGalleryIndex() {
    attachmentGalleryUIStore.index =
        (attachmentGalleryUIStore.index - 1 + attachmentGalleryUIStore.attachments.length) %
        attachmentGalleryUIStore.attachments.length;
}

export function setAttachmentGalleryIndex(index: number) {
    if (index > attachmentGalleryUIStore.attachments.length || index < 0) {
        return;
    }

    attachmentGalleryUIStore.index = index;
}
