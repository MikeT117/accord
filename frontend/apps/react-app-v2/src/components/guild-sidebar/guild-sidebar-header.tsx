import type { GuildType, Snapshot } from "@/lib/types/types";
import { GuildSidebarHeaderDropdown } from "./guild-sidebar-header-dropdown";

type GuildSidebarHeaderPropsType = Pick<Snapshot<GuildType>, "id" | "name">;

export function GuildSidebarHeader({ id, name }: GuildSidebarHeaderPropsType) {
    return (
        <div className="flex justify-between">
            <h1 className="font-medium truncate mr-2">{name}</h1>
            <GuildSidebarHeaderDropdown id={id} />
        </div>
    );
}
