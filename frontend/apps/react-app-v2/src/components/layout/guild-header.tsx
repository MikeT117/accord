import { useGuildStore } from "@/lib/zustand/stores/guild-store";
import { AvatarWithFallback } from "../avatar-with-fallback";
import { AppHeader } from "./app-header";
import { useShallow } from "zustand/react/shallow";

export function GuildHeader({ guildId }: { guildId: string }) {
    const guild = useGuildStore(
        useShallow((s) =>
            s.values[guildId] ? { icon: s.values[guildId]?.icon, name: s.values[guildId]?.name } : null,
        ),
    );

    if (!guild) {
        return null;
    }

    return (
        <AppHeader className="gap-2">
            <AvatarWithFallback src={guild.icon} fallback={guild.name} size="xs" />
            <span className="text-sm font-medium text-muted-foreground">{guild.name}</span>
        </AppHeader>
    );
}
