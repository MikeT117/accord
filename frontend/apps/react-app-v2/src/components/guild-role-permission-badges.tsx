import { generatePermissionsObj } from "@/lib/authorisation/permissions";
import { Badge } from "./ui/badge";

export function GuildRolePermissionBadges({ permissions }: { permissions: number }) {
    const permissionObj = generatePermissionsObj(permissions);
    return (
        <div className="flex gap-1 flex-wrap">
            {Object.entries(permissionObj).map(([key, val]) =>
                val ? (
                    <Badge key={key} variant="secondary">
                        {key}
                    </Badge>
                ) : null
            )}
        </div>
    );
}
