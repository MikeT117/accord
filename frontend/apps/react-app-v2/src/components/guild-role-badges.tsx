import { getGuildRolesByIDs } from "@/lib/valtio/queries/guild-store-queries";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { ChevronRight } from "lucide-react";

export function GuildRoleBadges({ guildId, roleIDs }: { guildId: string; roleIDs: string[] }) {
    const roles = getGuildRolesByIDs(guildId, roleIDs);
    if (!roles || !roles.length) {
        return null;
    }
    return (
        <div className="flex items-center gap-1">
            <Badge variant="secondary">{roles[0].name}</Badge>
            {roles.length > 1 && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size="icon-xs" variant="secondary">
                            <ChevronRight />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <ScrollArea>
                            <div className="flex flex-col">
                                {roles.map((r) => (
                                    <DropdownMenuItem key={r.id}>
                                        <span>{r.name}</span>
                                    </DropdownMenuItem>
                                ))}
                            </div>
                        </ScrollArea>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    );
}
