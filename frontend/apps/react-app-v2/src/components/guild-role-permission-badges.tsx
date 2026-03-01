import { generateRolePermissionsObj } from "@/lib/authorisation/permissions";
import { Badge } from "./ui/badge";

export function GuildRolePermissionBadges({ permissions }: { permissions: number }) {
    const permissionObj = generateRolePermissionsObj(permissions);
    if (!permissions) {
        return <Badge variant="secondary">Empty</Badge>;
    }

    return (
        <div className="flex flex-wrap gap-1">
            {Object.entries(permissionObj).map(([key, val]) =>
                val ? (
                    <Badge key={key} variant="secondary">
                        {key}
                    </Badge>
                ) : null,
            )}
        </div>
    );
}
