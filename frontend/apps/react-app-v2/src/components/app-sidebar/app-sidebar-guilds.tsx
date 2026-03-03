import { useParams, useNavigate } from "@tanstack/react-router";
import { AvatarWithFallback } from "../avatar-with-fallback";
import { ButtonWithTooltip } from "../button-with-tooltip";
import { useGuilds } from "@/lib/zustand/stores/guild-store";

export function AppSidebarGuilds() {
    const { guildId } = useParams({ strict: false });
    const guilds = useGuilds();
    const navigate = useNavigate();

    function handleGuildClick(id: string) {
        if (id === guildId) return;
        navigate({
            to: "/app/$guildId",
            params: { guildId: id },
        });
    }
    return (
        <div className="no-scrollbar flex min-h-0 flex-col items-center gap-3 overflow-auto py-1">
            {guilds.map((g) => (
                <ButtonWithTooltip
                    key={g.id}
                    tooltipText={`${g.name} Guild`}
                    side="right"
                    size="icon-sm"
                    className="relative"
                    onClick={() => handleGuildClick(g.id)}
                >
                    {guildId === g.id && <div className="absolute -left-3 h-3 w-1 rounded-r-xs bg-accent" />}
                    <AvatarWithFallback fallback={g.name} src={g.icon} size="default" />
                </ButtonWithTooltip>
            ))}
        </div>
    );
}
