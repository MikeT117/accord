import { RefreshCwOffIcon } from "lucide-react";
import { Alert, AlertTitle, AlertDescription, AlertAction } from "../ui/alert";
import { Button } from "../ui/button";

type GuildChannelSettingsPermissionSyncAlertProps = { onSync: () => void; isVisible: boolean };

export function GuildChannelSettingsPermissionSyncAlert({
    onSync,
    isVisible,
}: GuildChannelSettingsPermissionSyncAlertProps) {
    if (!isVisible) {
        return null;
    }
    return (
        <Alert className="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
            <RefreshCwOffIcon />
            <AlertTitle>Permissions mismatch with parent!</AlertTitle>
            <AlertDescription>Click 'Sync Now' to resync permissions.</AlertDescription>
            <AlertAction>
                <Button className="cursor-pointer" onClick={onSync}>
                    Sync Now
                </Button>
            </AlertAction>
        </Alert>
    );
}
