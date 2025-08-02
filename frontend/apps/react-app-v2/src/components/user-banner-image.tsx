import { CameraIcon } from "lucide-react";
import { Button } from "./ui/button";
import { env } from "@/lib/constants";

type BannerImageProps = {
    banner?: string | null;
    preview?: string | null;
    onMutate?: () => void;
};

export function UserBanner({ banner, preview, onMutate }: BannerImageProps) {
    return (
        <div className="relative h-32 w-full rounded-lg overflow-hidden bg-gradient-to-r from-emerald-500 to-fuchsia-600">
            {(preview || banner) && (
                <img
                    src={preview ? preview : `${env.CLOUDINARY_RES_URL}/${banner}`}
                    alt="Profile banner"
                    className="w-full h-full object-cover"
                />
            )}
            {typeof onMutate === "function" && (
                <Button variant="secondary" size="sm" className="absolute top-2 right-2" onClick={onMutate}>
                    <CameraIcon className="h-4 w-4 mr-1" />
                    Edit Banner
                </Button>
            )}
        </div>
    );
}
