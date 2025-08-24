import type { GuildType, Snapshot } from "@/lib/types/types";
import { GuildSidebarHeaderDropdown } from "./guild-sidebar-header-dropdown";
import { ChevronDownIcon, XIcon } from "lucide-react";

type GuildSidebarHeaderProps = Pick<Snapshot<GuildType>, "id" | "name">;

export function GuildSidebarHeader({ id, name }: GuildSidebarHeaderProps) {
    return (
        <GuildSidebarHeaderDropdown id={id} className="flex items-center justify-between border-b p-4">
            <h1 className="mr-2 truncate font-medium select-none">{name}</h1>
            <ChevronDownIcon size={20} className="group-data-[state=open]/guild-dropdown:hidden" />
            <XIcon size={20} className="group-data-[state=closed]/guild-dropdown:hidden" />
        </GuildSidebarHeaderDropdown>
    );
}
