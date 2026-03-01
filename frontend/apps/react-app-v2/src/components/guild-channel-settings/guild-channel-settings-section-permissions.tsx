import { BrickWallShieldIcon, CogIcon, Plus, ShieldIcon, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { useGuildChannelPermissions } from "@/lib/valtio/queries/guild-store-queries";
import { Switch } from "../ui/switch";
import { useDeleteRoleChannelAssoc } from "@/lib/react-query/mutations/delete-role-channel-assoc-mutation";
import { useCreateRoleChannelAssoc } from "@/lib/react-query/mutations/create-role-channel-assoc-mutation";
import { Controller, useForm } from "react-hook-form";
import { SettingsDialogUnsavedChanges } from "../settings-dialog/settings-dialog-unsaved-changes";
import { GuildRolePermissionBadges } from "../guild-role-permission-badges";
import { SettingsDialogContentSection } from "../settings-dialog/settings-dialog-content-section";
import { GuildChannelSettingsPermissionSyncAlert } from "./guild-channel-settings-permission-sync-alert";
import { useSyncChannelRoleAssociationsMutation } from "@/lib/react-query/mutations/sync-channel-role-associsations-mutation";
import { ButtonWithTooltip } from "../button-with-tooltip";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "../ui/item";
import { ScrollArea } from "../ui/scroll-area";
import { openGuildSettings } from "@/lib/valtio/mutations/guild-settings-ui-store-mutations";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "../ui/empty";
import { Button } from "../ui/button";
import { Field, FieldError } from "../ui/field";
import { GuildChannelType } from "@/lib/types/types";
import { GUILD_CHANNEL_TYPE } from "@/lib/zod-validation/channel-schema";

type GuildChannelSettingsPermissionsSectionProps = Pick<GuildChannelType, "id" | "guildId" | "channelType"> & {
    parentId?: string | null | undefined;
};

export function GuildChannelSettingsPermissionsSection({
    id,
    guildId,
    parentId,
    channelType,
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

    async function onSubmit() {
        if (isPrivate) {
            handleRoleAssign(defaultRoleId);
        } else {
            handleRoleUnassign(defaultRoleId);
        }
    }

    function resetForm() {
        form.reset({ isPrivate });
    }

    const isGuildCategoryChannel = channelType === GUILD_CHANNEL_TYPE.GUILD_CATEGORY_CHANNEL;

    return (
        <SettingsDialogContentSection title="Permissions" description="Manage roles, permissions and visibility.">
            <GuildChannelSettingsPermissionSyncAlert
                isVisible={!isGuildCategoryChannel && !!parentId && !isSyncedWithParent}
                onSync={handleSyncParentRoleAssociations}
            />
            <Card className="shrink-0 border-2 bg-transparent ring-0">
                <CardHeader>
                    <CardTitle>Visibility</CardTitle>
                    <CardDescription>Viewable by all or only users within a specific role.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form id="channel-channel-visibility" onSubmit={form.handleSubmit(onSubmit)}>
                        <Controller
                            control={form.control}
                            name="isPrivate"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <Item
                                        size="xs"
                                        variant="outline"
                                        className="border-2 has-[[aria-checked=true]]:bg-input/30"
                                    >
                                        <ItemMedia variant="icon">
                                            <BrickWallShieldIcon />
                                        </ItemMedia>
                                        <ItemContent>
                                            <ItemTitle>Private Channel</ItemTitle>
                                            <ItemDescription>
                                                Only members within assigned roles will be able to view the Channel.
                                            </ItemDescription>
                                        </ItemContent>
                                        <ItemActions>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </ItemActions>
                                    </Item>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                    </form>
                </CardContent>
            </Card>
            <Card className="shrink-0 border-2 bg-transparent ring-0">
                <CardHeader>
                    <CardTitle>Assigned Roles</CardTitle>
                    <CardDescription>Roles currently assigned to this channel.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {assignedRoles.map((role) => (
                            <Item variant="outline" key={role.id}>
                                <ItemMedia>
                                    <ShieldIcon className="size-5" />
                                </ItemMedia>
                                <ItemContent>
                                    <ItemTitle>{role.name}</ItemTitle>
                                    <GuildRolePermissionBadges permissions={role.permissions} />
                                </ItemContent>
                                <ItemActions>
                                    <ButtonWithTooltip
                                        tooltipText="Unassign Role"
                                        variant="destructive"
                                        size="icon-sm"
                                        onClick={() => handleRoleUnassign(role.id)}
                                    >
                                        <Trash2 />
                                    </ButtonWithTooltip>
                                </ItemActions>
                            </Item>
                        ))}
                        {assignedRoles.length === 0 && (
                            <Empty>
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <ShieldIcon />
                                    </EmptyMedia>
                                    <EmptyTitle>No Roles assigned</EmptyTitle>
                                    <EmptyDescription>
                                        You can add roles by clicking the button in the listed roles below.
                                    </EmptyDescription>
                                </EmptyHeader>
                            </Empty>
                        )}
                    </div>
                </CardContent>
            </Card>
            <Card className="shrink-0 border-2 bg-transparent ring-0">
                <CardHeader>
                    <CardTitle>Add Role</CardTitle>
                    <CardDescription>Assign additional roles to this channel.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="max-h-96">
                        <div className="flex flex-col space-y-3">
                            {availableRoles.map((role) => (
                                <Item variant="outline">
                                    <ItemMedia>
                                        <ShieldIcon className="size-5" />
                                    </ItemMedia>
                                    <ItemContent>
                                        <ItemTitle>{role.name}</ItemTitle>
                                        <GuildRolePermissionBadges permissions={role.permissions} />
                                    </ItemContent>
                                    <ItemActions>
                                        <ButtonWithTooltip
                                            variant="outline"
                                            size="icon-sm"
                                            tooltipText="Assign Role"
                                            onClick={() => handleRoleAssign(role.id)}
                                        >
                                            <Plus />
                                        </ButtonWithTooltip>
                                    </ItemActions>
                                </Item>
                            ))}
                            {availableRoles.length === 0 && (
                                <Empty>
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon">
                                            <ShieldIcon />
                                        </EmptyMedia>
                                        <EmptyTitle>No Roles available</EmptyTitle>
                                        <EmptyDescription>
                                            You can create roles in guild settings, they will then appear here.
                                        </EmptyDescription>
                                    </EmptyHeader>
                                    <EmptyContent className="flex-row justify-center gap-2">
                                        <Button variant="outline" onClick={openGuildSettings}>
                                            <CogIcon />
                                            <span>Guild Settings</span>
                                        </Button>
                                    </EmptyContent>
                                </Empty>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
            <SettingsDialogUnsavedChanges
                isVisible={form.formState.isDirty}
                onDiscard={resetForm}
                onSave={form.handleSubmit(onSubmit)}
            />
        </SettingsDialogContentSection>
    );
}
