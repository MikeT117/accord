import { CogIcon, GlobeIcon, LogOut, MoonIcon, PlusIcon, SunIcon, SunMoonIcon, UserRoundCogIcon } from "lucide-react";
import { AccordLogo } from "../accord-logo";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Avatar, AvatarImage } from "../ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { useGuildsArray } from "@/lib/valtio/queries/guild-store-queries";
import { openCreateGuildDialog } from "@/lib/valtio/mutations/create-guild-dialog-ui-store-mutations";
import { ButtonWithTooltip } from "../button-with-tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { cycleAppTheme } from "@/lib/valtio/mutations/theme-store-mutations";
import { useTheme } from "@/lib/valtio/queries/theme-store-queries";
import { useUser } from "@/lib/valtio/queries/user-store-queries";
import { openUserSettings } from "@/lib/valtio/mutations/user-settings-ui-store-mutations";
import { GuildIcon } from "../guild-icon";

export function AppSidebar() {
    const { guildId } = useParams({ strict: false });
    const guilds = useGuildsArray();
    const user = useUser();
    const theme = useTheme();

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

    return (
        <div className="flex w-[72px] flex-col items-center space-y-3 bg-background py-4">
            <div className="flex flex-col gap-1.5">
                <ButtonWithTooltip
                    tooltipText="User Dashboard"
                    side="right"
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-foreground text-accent"
                    onClick={handleUserDashboardClick}
                >
                    <AccordLogo />
                </ButtonWithTooltip>
                <ButtonWithTooltip
                    tooltipText="Public Servers"
                    side="right"
                    size="lg"
                    onClick={() => void 0}
                    className="flex h-10 w-10 items-center justify-center rounded-lg p-0"
                    variant="secondary"
                >
                    <GlobeIcon />
                </ButtonWithTooltip>

                <ButtonWithTooltip
                    tooltipText="Create Server"
                    side="right"
                    size="lg"
                    onClick={openCreateGuildDialog}
                    className="flex h-10 w-10 items-center justify-center rounded-lg p-0"
                    variant="secondary"
                >
                    <PlusIcon />
                </ButtonWithTooltip>
            </div>
            <div className="flex flex-col gap-1">
                {guilds.map((g) => (
                    <ButtonWithTooltip
                        key={g.id}
                        tooltipText={`${g.name} Server`}
                        side="right"
                        size="icon"
                        variant="link"
                        className="group relative h-10 w-10 rounded-lg p-0"
                        data-state={g.id === guildId ? "active" : "inactive"}
                        onClick={() => handleGuildClick(g.id)}
                    >
                        <div className="absolute -left-5 h-3 w-2 rounded-r-xs transition-all group-hover:h-5 group-data-[state=active]:bg-accent-foreground" />
                        <GuildIcon name={g.name} icon={g.icon} className="size-10 border-none" />
                    </ButtonWithTooltip>
                ))}
            </div>
            <div className="mt-auto">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <ButtonWithTooltip
                            size="icon"
                            className="overflow-hidden rounded-lg"
                            tooltipText="Settings"
                            side="right"
                        >
                            <Avatar className="h-full w-full items-center justify-center rounded-none">
                                <AvatarImage src={user.avatar ?? ""} alt={user.displayName} />
                                <AvatarFallback className="pointer-events-none rounded-none bg-transparent">
                                    MT
                                </AvatarFallback>
                            </Avatar>
                        </ButtonWithTooltip>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="min-w-56 rounded-lg" align="end" sideOffset={8} side="right">
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center  gap-2 px-1 py-1.5 text-sm">
                                <Avatar className="flex h-8 w-8 items-center justify-center rounded-lg">
                                    <AvatarImage src={user.avatar ?? ""} alt={user.displayName} />
                                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{user.displayName}</span>
                                    <span className="truncate text-xs">{user.username}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem onClick={openUserSettings}>
                                <CogIcon />
                                User Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <UserRoundCogIcon />
                                Edit Profile
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem onClick={cycleAppTheme}>
                                {theme === "dark" && <MoonIcon />}
                                {theme === "light" && <SunIcon />}
                                {theme === "system" && <SunMoonIcon />}
                                Cycle Theme
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <LogOut />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
