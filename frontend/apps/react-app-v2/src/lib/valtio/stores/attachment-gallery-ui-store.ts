import type { AttachmentType, UserType } from "@/lib/types/types";
import { proxy } from "valtio";

type AttachmentGalleryUIStore =
    | {
          isOpen: false;
          index: number;
          author: null;
          attachments: never[];
      }
    | {
          isOpen: true;
          index: number;
          author: UserType;
          attachments: AttachmentType[];
      };

export const attachmentGalleryUIStore = proxy<AttachmentGalleryUIStore>({
    isOpen: false,
    index: 0,
    author: null,
    attachments: [],
});
