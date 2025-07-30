import { Trash2, Plus, ShieldIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Switch } from "../ui/switch";
import { useDeleteRoleChannelAssoc } from "@/lib/react-query/mutations/delete-role-channel-assoc-mutation";
import { useCreateRoleChannelAssoc } from "@/lib/react-query/mutations/create-role-channel-assoc-mutation";
import { useForm } from "react-hook-form";
import { SettingsDialogUnsavedChanges } from "../settings-dialog/settings-dialog-unsaved-changes";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "../ui/form";
import { GuildRolePermissionBadges } from "../guild-role-permission-badges";
import { SettingsDialogContentSection } from "../settings-dialog/settings-dialog-content-section";
import { useGuildChannelPermissions } from "@/lib/valtio/queries/guild-store-queries";

type GuildChannelSettingsPermissionsSectionProps = {
    id: string;
    guildId: string;
};

export function GuildCategoryChannelSettingsPermissionsSection({
    id,
    guildId,
}: GuildChannelSettingsPermissionsSectionProps) {
    const { assignedRoles, availableRoles, defaultRoleId, isPrivate } = useGuildChannelPermissions(guildId, id);

    const form = useForm<{ isPrivate: boolean }>({
        defaultValues: { isPrivate },
        values: { isPrivate },
    });

    const { mutate: createRoleChannelAssoc } = useCreateRoleChannelAssoc({ onSuccess: resetForm });
    const { mutate: deleteRoleChannelAssoc } = useDeleteRoleChannelAssoc({ onSuccess: resetForm });

    function handleRoleAssign(roleId: string) {
        createRoleChannelAssoc({ channelId: id, guildId, roleId });
    }

    function handleRoleUnassign(roleId: string) {
        deleteRoleChannelAssoc({ channelId: id, guildId, roleId });
    }

    async function handleSaveChanges() {
        form.handleSubmit(() => {
            if (isPrivate) {
                handleRoleAssign(defaultRoleId);
            } else {
                handleRoleUnassign(defaultRoleId);
            }
        })();
    }

    function resetForm() {
        form.reset({ isPrivate });
    }

    return (
        <SettingsDialogContentSection
            title="Category Roles"
            description="Manage roles, permissions and visibility for this category."
        >
            <Card>
                <CardHeader>
                    <CardTitle>Visibility</CardTitle>
                    <CardDescription>Current visibility status of this category</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <FormField
                            control={form.control}
                            name="isPrivate"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 has-[[aria-checked=true]]:bg-muted">
                                    <div className="space-y-0.5">
                                        <FormLabel>Private Category</FormLabel>
                                        <FormDescription className="text-xs">
                                            Only members within selected roles will be able to view the category.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </Form>
                </CardContent>
            </Card>
            <SettingsDialogUnsavedChanges
                isVisible={form.formState.isDirty}
                onDiscard={resetForm}
                onSave={handleSaveChanges}
            />
            <Card>
                <CardHeader>
                    <CardTitle>Assigned Roles</CardTitle>
                    <CardDescription>Roles currently assigned to this category.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {assignedRoles.map((role) => (
                            <div key={role.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <ShieldIcon className="size-5 shrink-0" />
                                    <div className="space-y-1.5">
                                        <div className="font-medium">{role.name}</div>
                                        <GuildRolePermissionBadges permissions={role.permissions} />
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRoleUnassign(role.id)}
                                    className="text-destructive hover:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        {assignedRoles.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                No roles assigned to this category.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Add Role</CardTitle>
                    <CardDescription>Assign additional roles to this category.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {availableRoles.map((role) => (
                            <div key={role.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <ShieldIcon className="size-5" />
                                    <div className="space-y-1.5">
                                        <div className="font-medium">{role.name}</div>
                                        <GuildRolePermissionBadges permissions={role.permissions} />
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => handleRoleAssign(role.id)}>
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add
                                </Button>
                            </div>
                        ))}
                        {availableRoles.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                All available roles have been assigned.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </SettingsDialogContentSection>
    );
}
