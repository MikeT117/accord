import { useSnapshot } from "valtio";
import { attachmentGalleryUIStore } from "../stores/attachment-gallery-ui-store";

export function useAttachmentGalleryUIState() {
    const attachmentGalleryUIStoreSnapshot = useSnapshot(attachmentGalleryUIStore);
    return attachmentGalleryUIStoreSnapshot;
}
