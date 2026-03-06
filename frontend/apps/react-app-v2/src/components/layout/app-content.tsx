import { ReactNode } from "react";

export function AppContent({ children }: { children: ReactNode }) {
    return (
        <div className="col-start-2 row-start-2 grid h-full w-full grid-cols-[250px_1fr] grid-rows-[100%] overflow-hidden rounded-tl-md border-1">
            {children}
        </div>
    );
}
