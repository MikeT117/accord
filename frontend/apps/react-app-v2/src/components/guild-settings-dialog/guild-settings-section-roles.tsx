import { SettingsDialogContentSection } from "../settings-dialog/settings-dialog-content-section";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { GuildSettingsRoleEditor } from "./guild-settings-role-editor";
import { GuildSettingsRoleEditorSidebar } from "./guild-settings-role-editor-sidebar";
import { useCreateGuildRoleMutation } from "@/lib/react-query/mutations/create-role-mutation";
import { useDeleteGuildRoleMutation } from "@/lib/react-query/mutations/delete-role-mutation";
import { ButtonWithTooltip } from "../button-with-tooltip";
import { Card, CardContent } from "../ui/card";
import { ButtonGroup } from "../ui/button-group";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../ui/empty";
import { ChevronRight, ShieldCheckIcon, ShieldIcon, SquarePenIcon, Trash2Icon, Users2Icon } from "lucide-react";
import { FilterInput } from "../filter-input";
import { useGuildRoles } from "@/lib/zustand/stores/guild-store";
import { Dialogs, dialogUIStoreActions } from "@/lib/zustand/stores/dialog-ui-store";

type GuildSettingsRolesSectionProps = {
    guildId: string;
};

export function GuildSettingsRolesSection({ guildId }: GuildSettingsRolesSectionProps) {
    const { custom, defaultRole } = useGuildRoles(guildId);

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
        dialogUIStoreActions.openDialog(Dialogs.ConfirmDeleteAction, {
            actionFn: () => deleteGuildRole({ guildId, id }),
        });
    }

    if (editingRoleId) {
        const role = [...custom, defaultRole].find((r) => r.id === editingRoleId);

        if (!role) {
            return null;
        }

        return (
            <div className="flex h-svh">
                <GuildSettingsRoleEditorSidebar
                    roles={custom}
                    roleId={role.id}
                    onRoleChange={setEditingRoleId}
                    onCreateRole={handleCreateGuildRole}
                />
                <div className="flex h-full w-full flex-col gap-6">
                    <GuildSettingsRoleEditor role={role} />
                </div>
            </div>
        );
    }

    return (
        <SettingsDialogContentSection
            title="Guild Roles"
            description="Manage roles for this guild, grouping members and assigning permissions."
        >
            <Button
                variant="outline"
                className="flex w-full items-center gap-4 py-8"
                onClick={() => setEditingRoleId(defaultRole.id)}
            >
                <Users2Icon />
                <div className="text-start">
                    <h1>Default Permissions</h1>
                    <span className="text-xs text-muted-foreground">Permissions that apply to all guild members</span>
                </div>
                <ChevronRight className="ml-auto size-6 text-muted-foreground" />
            </Button>
            <div className="flex items-center space-x-2">
                <FilterInput filterValue={roleFilter} onChange={setRoleFilter} resultsCount={filteredRoles.length} />
                <Button onClick={handleCreateGuildRole}>Create Role</Button>
            </div>
            <Card className="bg-transparent p-0">
                <CardContent className="p-0">
                    {filteredRoles.length ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Roles - {custom.length}</TableHead>
                                    <TableHead className="text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRoles.map((r) => (
                                    <TableRow key={r.id}>
                                        <TableCell className="w-full">
                                            <div className="flex items-center space-x-1.5">
                                                <ShieldCheckIcon className="size-5" />
                                                <span className="text-xs">{r.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="flex space-x-1">
                                            <ButtonGroup>
                                                <ButtonWithTooltip
                                                    size="icon"
                                                    variant="secondary"
                                                    tooltipText="Edit Role"
                                                    onClick={() => setEditingRoleId(r.id)}
                                                >
                                                    <SquarePenIcon />
                                                </ButtonWithTooltip>
                                                <ButtonWithTooltip
                                                    size="icon"
                                                    variant="destructive"
                                                    onClick={() => handelDeleteGuildRole(r.id)}
                                                    tooltipText="Delete Role"
                                                >
                                                    <Trash2Icon />
                                                </ButtonWithTooltip>
                                            </ButtonGroup>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <ShieldIcon />
                                </EmptyMedia>
                                <EmptyTitle>No Roles Found</EmptyTitle>
                                <EmptyDescription>
                                    You can add roles by clicking the create role button above.
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    )}
                </CardContent>
            </Card>
        </SettingsDialogContentSection>
    );
}
