import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

type DestructiveIconButtonProps = {
    tooltipText: string;
} & Pick<Parameters<typeof TooltipContent>[0], "side"> &
    React.ComponentProps<"button">;

export function DestructiveIconButton({
    side,
    tooltipText,
    className,
    children,
    ...buttonProps
}: DestructiveIconButtonProps) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <button
                    className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-md border border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive/10 [&>svg]:size-4 [&>svg]:shrink-0",
                        className,
                    )}
                    {...buttonProps}
                >
                    {children}
                </button>
            </TooltipTrigger>
            <TooltipContent side={side}>
                <p>{tooltipText}</p>
            </TooltipContent>
        </Tooltip>
    );
}
