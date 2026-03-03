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
import { AvatarWithFallback } from "../avatar-with-fallback";
import { ButtonWithTooltip } from "../button-with-tooltip";
import { useUser } from "@/lib/zustand/stores/user-store";
import { tokenStoreActions } from "@/lib/zustand/stores/token-store";
import { Dialogs, dialogUIStoreActions } from "@/lib/zustand/stores/dialog-ui-store";
import { useTheme } from "@/components/theme-provider";

export function AppSidebarUser() {
    const user = useUser();
    const { theme, cycleTheme } = useTheme();

    function handleLogoutClick() {
        tokenStoreActions.reset();
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
                        <DropdownMenuItem onClick={() => dialogUIStoreActions.openDialog(Dialogs.UserSettings)}>
                            <CogIcon />
                            User Settings
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem onClick={cycleTheme}>
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
