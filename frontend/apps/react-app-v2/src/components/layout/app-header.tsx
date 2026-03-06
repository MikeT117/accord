import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export function AppHeader({ children, className }: { className?: string; children: ReactNode }) {
    return (
        <div className={cn("col-start-2 row-start-1 flex w-full items-center justify-center", className)}>
            {children}
        </div>
    );
}
