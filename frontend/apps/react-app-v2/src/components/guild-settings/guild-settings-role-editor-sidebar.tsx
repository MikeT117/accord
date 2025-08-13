import type { GuildRoleType, Snapshot } from "@/lib/types/types";
import { ArrowLeft, PlusIcon } from "lucide-react";
import { ButtonWithTooltip } from "../button-with-tooltip";
import { Button } from "../ui/button";

type GuildSettingsRoleEditorSidebarProps = {
    roleId: string;
    roles: Snapshot<GuildRoleType[]>;
    onCreateRole: () => void;
    onRoleChange: (roleId: string | null) => void;
};

export function GuildSettingsRoleEditorSidebar({
    roleId,
    roles,
    onCreateRole,
    onRoleChange,
}: GuildSettingsRoleEditorSidebarProps) {
    return (
        <div className="flex w-full max-w-[220px] flex-col space-y-3 border-r p-6">
            <div className="flex items-center justify-between py-2">
                <Button variant="link" className="h-min w-min p-0!" onClick={() => onRoleChange(null)}>
                    <ArrowLeft className="size-5" /> Back
                </Button>
                <ButtonWithTooltip
                    tooltipText="Create Role"
                    size="icon"
                    variant="link"
                    className="h-min w-min p-0!"
                    onClick={onCreateRole}
                >
                    <PlusIcon className="size-5" />
                </ButtonWithTooltip>
            </div>
            <nav className="flex flex-col space-y-0.5">
                {roles.map((r) => (
                    <button
                        key={r.id}
                        onClick={() => onRoleChange(r.id)}
                        className={`rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                            roleId === r.id ? "bg-muted text-accent-foreground" : "text-muted-foreground hover:bg-muted"
                        }`}
                    >
                        {r.name}
                    </button>
                ))}
            </nav>
        </div>
    );
}
