import type { ReactNode } from "react";

type DestructiveIconButtonProps = { children: ReactNode } & React.ComponentProps<"button">;

export function DestructiveIconButton({ children, ...props }: DestructiveIconButtonProps) {
    return (
        <button
            className="p-1.5 text-destructive bg-destructive/10 hover:bg-destructive/20 rounded-md border-destructive/20 border [&>svg]:shrink-0 [&>svg]:size-4"
            {...props}
        >
            {children}
        </button>
    );
}
