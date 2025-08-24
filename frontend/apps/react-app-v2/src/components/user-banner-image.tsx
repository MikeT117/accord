import { CameraIcon } from "lucide-react";
import { Button } from "./ui/button";
import { env } from "@/lib/constants";
import { Image } from "./Image";

type BannerImageProps = {
    banner?: string | null;
    preview?: string | null;
    onMutate?: () => void;
};

export function UserBanner({ banner, preview, onMutate }: BannerImageProps) {
    return (
        <div className="relative h-32 w-full overflow-hidden rounded-lg bg-gradient-to-r from-emerald-500 to-fuchsia-600">
            {(preview || banner) && (
                <Image
                    src={preview ? preview : `${env.CLOUDINARY_RES_URL}/${banner}`}
                    alt="Profile banner"
                    className="h-full w-full object-cover"
                />
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
