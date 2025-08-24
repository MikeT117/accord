import { env } from "@/lib/constants";

import { Image } from "@/components/Image";
import type { AttachmentType } from "@/lib/types/types";

type ChannelMessageAttachmentProps = {
    attachment: AttachmentType;
    onClick?: () => void;
};

export function ChannelMessageAttachment({ attachment, onClick }: ChannelMessageAttachmentProps) {
    return <Image src={`${env.CLOUDINARY_RES_URL}/${attachment.id}`} onClick={onClick} alt={attachment.filename} />;
}
