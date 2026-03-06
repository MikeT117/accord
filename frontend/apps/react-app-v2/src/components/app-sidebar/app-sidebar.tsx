import { GlobeIcon, PlusIcon } from "lucide-react";
import { AccordLogo } from "../accord-logo";
import { useNavigate } from "@tanstack/react-router";
import { ButtonWithTooltip } from "../button-with-tooltip";
import { AppSidebarActiveVoice } from "./app-sidebar-active-voice";
import { AppSidebarUser } from "./app-sidebar-user";
import { AppSidebarGuilds } from "./app-sidebar-guilds";
import { Dialogs, dialogUIStoreActions } from "@/lib/zustand/stores/dialog-ui-store";

export function AppSidebar() {
    const navigate = useNavigate();

    function handleUserDashboardClick() {
        navigate({ to: "/app/dashboard" });
    }

    function handleDiscoveravleGuildsClick() {
        navigate({ to: "/app/guild-browser" });
    }

    return (
        <div className="col-start-1 row-start-2 flex flex-col gap-4 px-4 pb-2">
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
                    onClick={() => dialogUIStoreActions.openDialog(Dialogs.CreateGuild)}
                    variant="outline"
                >
                    <PlusIcon />
                </ButtonWithTooltip>
            </div>
            <AppSidebarGuilds />
            <AppSidebarUser />
            <AppSidebarActiveVoice />
        </div>
    );
}
