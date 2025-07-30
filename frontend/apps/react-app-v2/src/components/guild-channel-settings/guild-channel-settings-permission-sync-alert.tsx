import { RefreshCwOffIcon } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";
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
        <Alert variant="warning">
            <RefreshCwOffIcon />
            <div className="flex justify-between items-center">
                <div className="flex flex-col">
                    <AlertTitle>{`Permissions not synced with category`}</AlertTitle>
                    <AlertDescription>
                        <p>Click 'Sync Now' to mirror the permissions of this channel's parent category.</p>
                    </AlertDescription>
                </div>
                <div className="flex space-x-2">
                    <Button onClick={onSync}>Sync Now</Button>
                </div>
            </div>
        </Alert>
    );
}
