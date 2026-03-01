import { CameraIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Image } from "./image";

type BannerImageProps = {
    src?: string | null;
    preview?: string | null;
    onMutate?: () => void;
};

export function UserBanner({ src, preview, onMutate }: BannerImageProps) {
    return (
        <div className="relative flex h-32 w-full justify-center overflow-hidden rounded-lg bg-gradient-to-r from-emerald-500 to-fuchsia-600">
            {(preview || src) && (
                <Image src={src} preview={preview} alt="Profile banner" className="h-full w-full object-cover" />
            )}
            {typeof onMutate === "function" && (
                <Button variant="secondary" size="sm" className="absolute top-2 right-2" onClick={onMutate}>
                    <CameraIcon className="mr-1 h-4 w-4" />
                    Edit Banner
                </Button>
            )}
        </div>
    );
}
