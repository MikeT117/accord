import type { ValueOf } from "@/lib/types/types";
import { cn } from "@/lib/utils";
import { FileWarningIcon } from "lucide-react";
import { useState } from "react";
import { useInView } from "react-intersection-observer";

const IMAGE_LOADING_STATE = {
    Failure: -1,
    Idle: 0,
    Loading: 1,
    Success: 2,
} as const;

type ImageProps = {
    src?: string | null;
    alt: string;
    onClick?: () => void;
    className?: string;
};

export function Image({ alt, className, onClick, src }: ImageProps) {
    const [status, set] = useState<ValueOf<typeof IMAGE_LOADING_STATE>>(IMAGE_LOADING_STATE.Idle);

    const isIdle = status === IMAGE_LOADING_STATE.Idle;
    const isLoading = status === IMAGE_LOADING_STATE.Loading;
    const isSuccess = status === IMAGE_LOADING_STATE.Success;
    const isError = status === IMAGE_LOADING_STATE.Failure;

    const { ref: inViewRef } = useInView({
        threshold: 0.75,
        onChange(inView) {
            if (inView && isIdle) {
                set(IMAGE_LOADING_STATE.Loading);
            }
        },
    });

    const handleImageOnLoad = () => set(IMAGE_LOADING_STATE.Success);
    const handleImageOnError = () => set(IMAGE_LOADING_STATE.Failure);

    if (isError) {
        return (
            <div
                ref={inViewRef}
                className="flex h-[180px] w-[320px] items-center justify-center rounded-lg border border-destructive/30 bg-destructive/15"
            >
                <FileWarningIcon className="text-destructive" />
            </div>
        );
    }

    return (
        <div
            ref={inViewRef}
            className={cn(
                "relative max-h-[180px] max-w-[320px] overflow-hidden rounded-lg",
                typeof onClick === "function" ? "cursor-pointer" : "",
                className,
            )}
            onClick={onClick}
        >
            {(isIdle || isLoading) && <div className="animate-pulse bg-accent" />}
            {(isLoading || isSuccess) && (
                <img
                    src={src ?? ""}
                    className={cn(
                        "invisible max-h-[180px] max-w-[320px] ring-0 outline-none",
                        isLoading ? "pointer-events-none" : "visible",
                        className,
                    )}
                    onLoad={handleImageOnLoad}
                    onError={handleImageOnError}
                    alt={alt}
                />
            )}
        </div>
    );
}
