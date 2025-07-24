import { CogIcon, GlobeIcon, LogOut, MoonIcon, PlusIcon, SunIcon, SunMoonIcon, UserRoundCogIcon } from "lucide-react";
import { AccordLogo } from "../accord-logo";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Avatar, AvatarImage } from "../ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { useGuilds } from "@/lib/valtio/queries/guild-store-queries";
import { ButtonWithTooltip } from "../button-with-tooltip";
import { cn } from "@/lib/utils";
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

export function AppSidebar() {
    const { guildId } = useParams({ strict: false });
    const guilds = useGuilds();
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

    return (
        <div className="flex flex-col items-center w-[72px] bg-background py-4 space-y-3">
            <div className="flex flex-col gap-1.5">
                <ButtonWithTooltip
                    tooltipText="User Dashboard"
                    side="right"
                    className="flex justify-center items-center bg-accent-foreground text-accent h-10 w-10 rounded-lg"
                >
                    <AccordLogo />
                </ButtonWithTooltip>
                <ButtonWithTooltip
                    tooltipText="Public Servers"
                    side="right"
                    size="lg"
                    onClick={() => void 0}
                    className="flex justify-center items-center p-0 h-10 w-10 rounded-lg"
                    variant="secondary"
                >
                    <GlobeIcon />
                </ButtonWithTooltip>

                <ButtonWithTooltip
                    tooltipText="Create Server"
                    side="right"
                    size="lg"
                    onClick={() => void 0}
                    className="flex justify-center items-center p-0 h-10 w-10 rounded-lg"
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
                        variant="ghost"
                        className={cn("p-0 h-10 w-10 rounded-lg", g.id === guildId ? "bg-accent" : "")}
                        onClick={() => handleGuildClick(g.id)}
                    >
                        <Avatar className="flex justify-center items-center rounded-none object-scale-down h-full w-full">
                            <AvatarImage src={g.icon ?? ""} />
                            <AvatarFallback className="rounded-md pointer-events-none">
                                {g.name[0].toUpperCase() + "S"}
                            </AvatarFallback>
                        </Avatar>
                    </ButtonWithTooltip>
                ))}
            </div>
            <div className="mt-auto">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <ButtonWithTooltip
                            size="icon"
                            className="rounded-lg overflow-hidden"
                            tooltipText="Settings"
                            side="right"
                        >
                            <Avatar className="rounded-none h-full w-full items-center justify-center">
                                <AvatarImage src={user.avatar ?? ""} alt={user.displayName} />
                                <AvatarFallback className="rounded-none bg-transparent pointer-events-none">
                                    MT
                                </AvatarFallback>
                            </Avatar>
                        </ButtonWithTooltip>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="min-w-56 rounded-lg" align="end" sideOffset={8} side="right">
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center  gap-2 px-1 py-1.5 text-sm">
                                <Avatar className="flex justify-center items-center h-8 w-8 rounded-lg">
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
                            <DropdownMenuItem>
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
