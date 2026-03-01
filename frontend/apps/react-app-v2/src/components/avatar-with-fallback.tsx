import { CameraIcon } from "lucide-react";
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "./ui/avatar";
import { env } from "@/lib/constants";

type AvatarWithFallbackProps = {
    src?: string | null;
    preview?: string | null;
    fallback: string;
    alt?: string;
    onMutate?: () => void;
    className?: string;
} & React.ComponentProps<typeof Avatar>;

export function AvatarWithFallback({
    fallback,
    alt,
    src,
    preview,
    onMutate,
    size = "lg",
    className,
}: AvatarWithFallbackProps) {
    const fallbackText = fallback
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();

    const altText = typeof alt === "undefined" ? fallback : alt;
    const isMutable = typeof onMutate === "function";

    return (
        <Avatar size={size} className={className}>
            {(preview || src) && <AvatarImage src={preview ?? `${env.CLOUDINARY_RES_URL}/${src}`} alt={altText} />}
            <AvatarFallback>{fallbackText}</AvatarFallback>
            {isMutable && (
                <AvatarBadge onClick={onMutate}>
                    <CameraIcon />
                </AvatarBadge>
            )}
        </Avatar>
    );
}
