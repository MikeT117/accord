import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

type TooltipButtonProps = {
    tooltipText: string;
} & Pick<Parameters<typeof TooltipContent>[0], "side"> &
    Parameters<typeof Button>[0];

export function ButtonWithTooltip({ side, tooltipText, children, ...buttonProps }: TooltipButtonProps) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button {...buttonProps}>{children}</Button>
            </TooltipTrigger>
            <TooltipContent side={side}>
                <p>{tooltipText}</p>
            </TooltipContent>
        </Tooltip>
    );
}
