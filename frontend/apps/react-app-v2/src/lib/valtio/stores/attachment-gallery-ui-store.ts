import type { AttachmentType, UserType } from "@/lib/types/types";
import { proxy } from "valtio";
import { devtools } from "valtio/utils";

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
devtools(attachmentGalleryUIStore, { name: "attachment gallery ui store", enabled: true });
