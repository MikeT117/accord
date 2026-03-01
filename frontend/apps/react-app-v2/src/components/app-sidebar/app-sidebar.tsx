import { GlobeIcon, PlusIcon } from "lucide-react";
import { AccordLogo } from "../accord-logo";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useGuildsArray } from "@/lib/valtio/queries/guild-store-queries";
import { openCreateGuildDialog } from "@/lib/valtio/mutations/create-guild-dialog-ui-store-mutations";
import { ButtonWithTooltip } from "../button-with-tooltip";
import { AvatarWithFallback } from "../avatar-with-fallback";
import { AppSidebarActiveVoice } from "./app-sidebar-active-voice";
import { AppSidebarUser } from "./app-sidebar-user";

export function AppSidebar() {
    const { guildId } = useParams({ strict: false });
    const guilds = useGuildsArray();

    const navigate = useNavigate();

    function handleGuildClick(id: string) {
        if (id === guildId) return;
        navigate({
            to: "/app/$guildId",
            params: { guildId: id },
        });
    }

    function handleUserDashboardClick() {
        navigate({
            to: "/app/dashboard",
        });
    }

    function handleDiscoveravleGuildsClick() {
        navigate({
            to: "/app/guild-browser",
        });
    }

    return (
        <div className="flex h-svh w-[50px] flex-col gap-4 border-r pt-2">
            <div className="flex h-min flex-col items-center gap-2">
                <ButtonWithTooltip
                    size="icon-lg"
                    tooltipText="User Dashboard"
                    side="right"
                    onClick={handleUserDashboardClick}
                >
                    <AccordLogo />
                </ButtonWithTooltip>
                <ButtonWithTooltip
                    tooltipText="Public Guilds"
                    side="right"
                    size="icon-lg"
                    onClick={handleDiscoveravleGuildsClick}
                    variant="outline"
                >
                    <GlobeIcon />
                </ButtonWithTooltip>
                <ButtonWithTooltip
                    tooltipText="Create Guild"
                    side="right"
                    size="icon-lg"
                    onClick={openCreateGuildDialog}
                    variant="outline"
                >
                    <PlusIcon />
                </ButtonWithTooltip>
            </div>
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
            <AppSidebarUser />
            <AppSidebarActiveVoice />
        </div>
    );
}
