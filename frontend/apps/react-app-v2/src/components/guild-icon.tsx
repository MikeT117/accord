import { CameraIcon } from "lucide-react";
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "./ui/avatar";
import { env } from "@/lib/constants";

type GuildIconProps = {
    icon?: string | null;
    name: string;
    preview?: string | null;
    onMutate?: () => void;
    className?: string;
} & React.ComponentProps<typeof Avatar>;

export function GuildIcon({ name, icon, preview, onMutate, size = "lg", className }: GuildIconProps) {
    const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();

    const imageSrc = (() => {
        if (preview) {
            return preview;
        }

        if (icon) {
            return `${env.CLOUDINARY_RES_URL}/${icon}`;
        }

        return "";
    })();

    const isMutable = typeof onMutate === "function";

    return (
        <Avatar size={size} className={className}>
            <AvatarImage src={imageSrc} alt={name} />
            <AvatarFallback>{initials}</AvatarFallback>
            {isMutable && (
                <AvatarBadge onClick={onMutate}>
                    <CameraIcon />
                </AvatarBadge>
            )}
        </Avatar>
    );
}
