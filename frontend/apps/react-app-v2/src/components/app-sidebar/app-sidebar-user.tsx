import { cycleAppTheme } from "@/lib/valtio/mutations/theme-store-mutations";
import { openUserSettings } from "@/lib/valtio/mutations/user-settings-ui-store-mutations";
import { useUser } from "@/lib/valtio/queries/user-store-queries";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuGroup,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { CogIcon, MoonIcon, SunIcon, SunMoonIcon, LogOut } from "lucide-react";
import { useTheme } from "@/lib/valtio/queries/theme-store-queries";
import { AvatarWithFallback } from "../avatar-with-fallback";
import { ButtonWithTooltip } from "../button-with-tooltip";
import { handleResetTokenStore } from "@/lib/valtio/mutations/token-store-mutations";

export function AppSidebarUser() {
    const user = useUser();
    const theme = useTheme();

    function handleLogoutClick() {
        handleResetTokenStore();
        location.reload();
    }

    return (
        <div className="mt-auto mb-2 flex flex-col items-center space-y-3">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <ButtonWithTooltip
                        size="icon-lg"
                        className="overflow-hidden rounded-lg"
                        tooltipText="Settings"
                        side="right"
                    >
                        <AvatarWithFallback fallback={user.displayName} src={user.avatar} />
                    </ButtonWithTooltip>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="min-w-56 rounded-lg" align="end" sideOffset={8} side="right">
                    <DropdownMenuLabel className="p-0 font-normal">
                        <div className="flex items-center  gap-2 px-1 py-1.5 text-sm">
                            <AvatarWithFallback fallback={user.displayName} src={user.avatar} size="default" />
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
                    <DropdownMenuItem onClick={handleLogoutClick}>
                        <LogOut />
                        Log out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
