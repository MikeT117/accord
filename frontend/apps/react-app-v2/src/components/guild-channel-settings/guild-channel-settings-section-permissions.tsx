import { Plus, ShieldIcon, ShieldUserIcon, Trash2Icon } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { useGuildChannelPermissions } from "@/lib/valtio/queries/guild-store-queries";
import { Switch } from "../ui/switch";
import { useDeleteRoleChannelAssoc } from "@/lib/react-query/mutations/delete-role-channel-assoc-mutation";
import { useCreateRoleChannelAssoc } from "@/lib/react-query/mutations/create-role-channel-assoc-mutation";
import { useForm } from "react-hook-form";
import { SettingsDialogUnsavedChanges } from "../settings-dialog/settings-dialog-unsaved-changes";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "../ui/form";
import { GuildRolePermissionBadges } from "../guild-role-permission-badges";
import { SettingsDialogContentSection } from "../settings-dialog/settings-dialog-content-section";
import { GuildChannelSettingsPermissionSyncAlert } from "./guild-channel-settings-permission-sync-alert";
import { useSyncChannelRoleAssociationsMutation } from "@/lib/react-query/mutations/sync-channel-role-associsations-mutation";
import { DestructiveIconButton } from "../destructive-icon-button";

type GuildChannelSettingsPermissionsSectionProps = {
    id: string;
    guildId: string;
    parentId: string | null;
};

export function GuildChannelSettingsPermissionsSection({
    id,
    guildId,
    parentId,
}: GuildChannelSettingsPermissionsSectionProps) {
    const { assignedRoles, availableRoles, defaultRoleId, isPrivate, isSyncedWithParent } = useGuildChannelPermissions(
        guildId,
        id,
    );

    const { mutate: syncChannelRoleAssociations } = useSyncChannelRoleAssociationsMutation({ onSuccess: resetForm });
    const { mutate: createRoleChannelAssoc } = useCreateRoleChannelAssoc({ onSuccess: resetForm });
    const { mutate: deleteRoleChannelAssoc } = useDeleteRoleChannelAssoc({ onSuccess: resetForm });

    const form = useForm<{ isPrivate: boolean }>({
        defaultValues: { isPrivate },
        values: { isPrivate },
    });

    function handleRoleAssign(roleId: string) {
        createRoleChannelAssoc({ channelId: id, guildId, roleId });
    }

    function handleRoleUnassign(roleId: string) {
        deleteRoleChannelAssoc({ channelId: id, guildId, roleId });
    }

    function handleSyncParentRoleAssociations() {
        if (!parentId) {
            return;
        }

        syncChannelRoleAssociations({ guildId, sourceChannelId: id, targetChannelId: parentId });
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
            title="Channel Roles"
            description="Manage roles, permissions and visibility for this channel."
        >
            {parentId && isSyncedWithParent === false && (
                <GuildChannelSettingsPermissionSyncAlert
                    isVisible={!isSyncedWithParent}
                    onSync={handleSyncParentRoleAssociations}
                />
            )}
            <Card>
                <CardHeader>
                    <CardTitle>Visibility</CardTitle>
                    <CardDescription>Current visibility status of this channel</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <FormField
                            control={form.control}
                            name="isPrivate"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 has-[[aria-checked=true]]:bg-muted">
                                    <div className="space-y-0.5">
                                        <FormLabel>Private Channel</FormLabel>
                                        <FormDescription className="text-xs">
                                            Only members within selected roles will be able to view the channel.
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
            <Card>
                <CardHeader>
                    <CardTitle>Assigned Roles</CardTitle>
                    <CardDescription>Roles currently assigned to this channel.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {assignedRoles.map((role) => (
                            <div key={role.id} className="flex items-center justify-between rounded-lg border p-3">
                                <div className="flex items-center gap-3">
                                    <ShieldIcon className="size-5 shrink-0" />
                                    <div className="space-y-1.5">
                                        <div className="font-medium">{role.name}</div>
                                        <GuildRolePermissionBadges permissions={role.permissions} />
                                    </div>
                                </div>

                                <DestructiveIconButton
                                    onClick={() => handleRoleUnassign(role.id)}
                                    tooltipText="Remove Role"
                                >
                                    <Trash2Icon />
                                </DestructiveIconButton>
                            </div>
                        ))}
                        {assignedRoles.length === 0 && (
                            <div className="py-8 text-center text-muted-foreground">
                                No roles assigned to this channel.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Add Role</CardTitle>
                    <CardDescription>Assign additional roles to this channel.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {availableRoles.map((role) => (
                            <div key={role.id} className="flex items-center justify-between rounded-lg border p-3">
                                <div className="flex items-center gap-3">
                                    <ShieldUserIcon className="size-5 shrink-0" />
                                    <div className="space-y-1.5">
                                        <div className="font-medium">{role.name}</div>
                                        <GuildRolePermissionBadges permissions={role.permissions} />
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => handleRoleAssign(role.id)}>
                                    <Plus className="mr-1 h-4 w-4" />
                                    Add
                                </Button>
                            </div>
                        ))}
                        {availableRoles.length === 0 && (
                            <div className="py-8 text-center text-muted-foreground">
                                All available roles have been assigned.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
            <SettingsDialogUnsavedChanges
                isVisible={form.formState.isDirty}
                onDiscard={resetForm}
                onSave={handleSaveChanges}
            />
        </SettingsDialogContentSection>
    );
}
