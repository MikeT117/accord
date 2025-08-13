import { CameraIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { env } from "@/lib/constants";

type UserAvatarProps = {
    avatar?: string | null;
    preview?: string | null;
    displayName: string;
    onMutate?: () => void;
    className?: string;
};

export function UserAvatar({ displayName, avatar, preview, onMutate, className }: UserAvatarProps) {
    return (
        <div className="relative">
            <Avatar
                className={cn(
                    "border-4 border-background flex overflow-hidden bg-accent justify-center items-center",
                    "h-16 w-16",
                    className
                )}
            >
                {(avatar || preview) && (
                    <AvatarImage src={preview ? preview : `${env.CLOUDINARY_RES_URL}/${avatar}`} alt={displayName} />
                )}
                <AvatarFallback className="">
                    {displayName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                </AvatarFallback>
            </Avatar>
            {typeof onMutate === "function" && (
                <Button size="sm" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0" onClick={onMutate}>
                    <CameraIcon className="h-3 w-3" />
                </Button>
            )}
        </div>
    );
}
