import type { ValueOf } from "@/lib/types/types";
import { cn } from "@/lib/utils";
import { FileWarningIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Skeleton } from "./ui/skeleton";
import { env } from "@/lib/constants";
import clsx from "clsx";

const IMAGE_LOADING_STATE = {
    Failure: -1,
    Idle: 0,
    Loading: 1,
    Success: 2,
} as const;

type ImageProps = {
    src?: string | null;
    preview?: string | null;
    alt: string;
    onClick?: () => void;
    className?: string;
};

export function Image({ alt, className, onClick, src, preview }: ImageProps) {
    const [status, setStatus] = useState<ValueOf<typeof IMAGE_LOADING_STATE>>(IMAGE_LOADING_STATE.Idle);

    const isIdle = status === IMAGE_LOADING_STATE.Idle;
    const isLoading = status === IMAGE_LOADING_STATE.Loading;
    const isSuccess = status === IMAGE_LOADING_STATE.Success;
    const isError = status === IMAGE_LOADING_STATE.Failure;

    const { ref: inViewRef } = useInView({
        threshold: 0.75,
        onChange(inView) {
            if (!inView || !isIdle) {
                return;
            }

            setStatus(IMAGE_LOADING_STATE.Loading);
        },
    });

    useEffect(() => {
        setStatus(IMAGE_LOADING_STATE.Loading);
    }, [preview]);

    const handleImageOnLoad = () => setStatus(IMAGE_LOADING_STATE.Success);
    const handleImageOnError = () => setStatus(IMAGE_LOADING_STATE.Failure);

    if ((!src && !preview) || isError) {
        return (
            <div
                ref={inViewRef}
                className={clsx(
                    "flex aspect-video w-3xs flex-col items-center justify-center gap-2 rounded-md border border-destructive/20 bg-destructive/10",
                    className,
                )}
            >
                <FileWarningIcon className="text-destructive/75" />
                <span className="text-xs text-muted-foreground">Unable to load image!</span>
            </div>
        );
    }

    return (
        <div
            ref={inViewRef}
            className={cn(
                "relative overflow-hidden rounded-md ",
                typeof onClick === "function" ? "cursor-pointer" : "",
                className,
            )}
            onClick={onClick}
        >
            {(isIdle || isLoading) && <Skeleton className="aspect-video w-3xs" />}
            {(isLoading || isSuccess) && (
                <img
                    src={preview ?? `${env.CLOUDINARY_RES_URL}/${src}`}
                    className={cn("invisible", isLoading ? "pointer-events-none" : "visible", className)}
                    onLoad={handleImageOnLoad}
                    onError={handleImageOnError}
                    alt={alt}
                />
            )}
        </div>
    );
}
