import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/react";

export function GuildSidebarDnDDroppable() {
    const { ref, isDropTarget } = useDroppable({
        id: Symbol().toString(),
        data: { parentId: null },
    });

    return (
        <div ref={ref} className="h-full w-full p-2">
            <div className={cn("h-full w-full rounded-lg", isDropTarget ? "bg-sidebar-accent" : "")} />
        </div>
    );
}
