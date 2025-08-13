import { CameraIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { env } from "@/lib/constants";

type GuildIconProps = {
    icon?: string | null;
    name: string;
    preview?: string | null;
    onMutate?: () => void;
    className?: string;
};

export function GuildIcon({ name, icon, preview, onMutate, className }: GuildIconProps) {
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
        <div className="relative">
            <Avatar
                className={cn(
                    "border-4 border-background flex overflow-hidden bg-accent justify-center items-center rounded-3xl",
                    "size-16",
                    className
                )}
            >
                <AvatarImage src={imageSrc} alt={name} />
                <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            {isMutable && (
                <Button size="sm" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0" onClick={onMutate}>
                    <CameraIcon className="h-3 w-3" />
                </Button>
            )}
        </div>
    );
}
