import { SettingsDialogContentSection } from "../settings-dialog/settings-dialog-content-section";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { ChevronRight, PencilIcon, ShieldUserIcon, Trash2Icon, Users2Icon } from "lucide-react";
import { DestructiveIconButton } from "../destructive-icon-button";
import { useGuildRolesArray } from "@/lib/valtio/queries/guild-store-queries";
import { GuildSettingsRoleEditor } from "./guild-settings-role-editor";
import { GuildSettingsRoleEditorSidebar } from "./guild-settings-role-editor-sidebar";
import { useCreateGuildRoleMutation } from "@/lib/react-query/mutations/create-role-mutation";
import { useDeleteGuildRoleMutation } from "@/lib/react-query/mutations/delete-role-mutation";
import { Input } from "../ui/input";

type GuildSettingsRolesSectionProps = {
    guildId: string;
};

export function GuildSettingsRolesSection({ guildId }: GuildSettingsRolesSectionProps) {
    const { custom, defaultRole } = useGuildRolesArray(guildId);

    const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
    const [roleFilter, setRoleFilter] = useState("");

    const { mutate: deleteGuildRole } = useDeleteGuildRoleMutation();
    const { mutate: createGuildRole } = useCreateGuildRoleMutation();

    const filteredRoles = roleFilter.trim().length
        ? custom.filter((r) => r.name.toLowerCase().includes(roleFilter.toLowerCase()))
        : custom;

    function handleCreateGuildRole() {
        createGuildRole({ guildId });
    }

    function handelDeleteGuildRole(id: string) {
        deleteGuildRole({ guildId, id });
    }

    if (editingRoleId) {
        const role = [...custom, defaultRole].find((r) => r.id === editingRoleId);

        if (role) {
            return (
                <div className="flex h-full">
                    <GuildSettingsRoleEditorSidebar
                        roles={custom}
                        roleId={role.id}
                        onRoleChange={setEditingRoleId}
                        onCreateRole={handleCreateGuildRole}
                    />
                    <GuildSettingsRoleEditor role={role} />
                </div>
            );
        }
    }

    return (
        <SettingsDialogContentSection
            title="Server Roles"
            description="Manage roles for this server, grouping members and assigning permissions."
        >
            <button
                className="flex w-full cursor-pointer items-center gap-6 rounded-lg border bg-card p-4 text-foreground hover:bg-accent dark:text-muted-foreground dark:hover:text-white"
                onClick={() => setEditingRoleId(defaultRole.id)}
            >
                <Users2Icon className="size-6" />
                <div className="space-y-0.5">
                    <h1 className="text-start font-medium">Default Permissions</h1>
                    <p className="text-xs">@default - applies to all server members</p>
                </div>
                <ChevronRight className="ml-auto size-6" />
            </button>
            <div className="flex items-center space-x-3">
                <Input
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.currentTarget.value)}
                    placeholder="Search Roles"
                />
                <Button onClick={handleCreateGuildRole}>Create Role</Button>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Roles - {custom.length}</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredRoles.map((r) => (
                        <TableRow key={r.id}>
                            <TableCell className="w-full">
                                <div className="flex items-center space-x-1.5">
                                    <ShieldUserIcon />
                                    <p>{r.name}</p>
                                </div>
                            </TableCell>
                            <TableCell className="flex space-x-2">
                                <Button size="icon" variant="outline" onClick={() => setEditingRoleId(r.id)}>
                                    <PencilIcon />
                                </Button>
                                <DestructiveIconButton
                                    onClick={() => handelDeleteGuildRole(r.id)}
                                    tooltipText="Delete Role"
                                >
                                    <Trash2Icon />
                                </DestructiveIconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </SettingsDialogContentSection>
    );
}
