import { Switch } from "../ui/switch";
import { Controller, useForm } from "react-hook-form";
import { SettingsDialogUnsavedChanges } from "../settings-dialog/settings-dialog-unsaved-changes";
import type { GuildRoleType } from "@/lib/types/types";
import { useUpdateGuildRoleMutation } from "@/lib/react-query/mutations/update-role-mutation";
import { generateRolePermissionsNumber, generateRolePermissionsObj } from "@/lib/authorisation/permissions";
import { Input } from "../ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { GuildSettingsRoleMembersEditor } from "./guild-settings-role-members-editor";
import { Button } from "../ui/button";
import { RotateCcwKeyIcon } from "lucide-react";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "../ui/item";
import { ScrollArea } from "../ui/scroll-area";
import { UpdateGuildRoleFormType } from "./types/guild-settings-dialog-types";
import { updateGuildRoleFormSchema } from "./zod-validation/guild-settings-form-validation";

const permissionsConfig = [
    {
        name: "CreateChannelMessage",
        label: "Create Channel Messages",
        description: "Grants members to send message in channels with this role applied.",
    },
    {
        name: "CreateChannelPin",
        label: "Pin Messages",
        description: "Grants members to pin messages in channels with this role applied.",
    },
    {
        name: "GuildAdmin",
        label: "Guild Admin",
        description: "Grants members guiild admin rights.",
    },
    {
        name: "ManageChannelMessage",
        label: "Manage Messages",
        description:
            "Grants the ability to manage message in channels, including deleting other users messages, marking as spam etc.",
    },
    {
        name: "ManageGuild",
        label: "Manage Guild",
        description:
            "Grants members the ability to manage this guild, allowing them to create & modify channels, roles, role assignments, modify server info etc.",
    },
    {
        name: "ManageGuildChannel",
        label: "Manage Channel",
        description:
            "Grants members the ability to manage channels, allowing them to modify channels, updating info etc.",
    },
    {
        name: "ViewGuildChannel",
        label: "View Channel",
        description: "Grants members the ability to view channels.",
    },
    {
        name: "ViewGuildMember",
        label: "View Guild Members",
        description: "Grants members the ability to view guild members list.",
    },
] as const;

type GuildSettingsRolesEditorProps = {
    role: GuildRoleType;
};

export function GuildSettingsRoleEditor({ role }: GuildSettingsRolesEditorProps) {
    const { mutate: updateGuildRole } = useUpdateGuildRoleMutation({
        onSuccess: resetForm,
    });

    const defaultValues = {
        name: role.name,
        ...generateRolePermissionsObj(role.permissions),
    };

    const isRootRole = role.name === "@default" || role.name === "@owner";
    const defaultTab = isRootRole ? "permissions" : "display";

    const form = useForm<UpdateGuildRoleFormType>({
        defaultValues,
        values: defaultValues,
        resolver: zodResolver(updateGuildRoleFormSchema),
    });

    async function handleSaveChanges() {
        form.handleSubmit(({ name, ...permissions }) => {
            updateGuildRole({
                ...role,
                name,
                permissions: generateRolePermissionsNumber(permissions),
            });
        })();
    }

    function resetForm() {
        form.reset(defaultValues);
    }

    function clearPermissions() {
        for (const field of Object.keys(form.control._fields)) {
            if (field !== "name") {
                form.setValue(field as keyof typeof defaultValues, false, {
                    shouldDirty: true,
                });
            }
        }
    }

    return (
        <ScrollArea className="">
            <div className="relative h-svh w-full space-y-3 py-6 pr-20 pl-6">
                <Tabs defaultValue={defaultTab} className="space-y-1.5">
                    <div className="flex flex-col space-y-1">
                        <h2 className="text-2xl font-semibold">Role Editor - {role.name}</h2>
                        <p className="text-sm text-muted-foreground">Edit role details, permissions and assignments.</p>
                    </div>
                    <TabsList className="w-full">
                        <TabsTrigger value="display" disabled={isRootRole}>
                            Display
                        </TabsTrigger>
                        <TabsTrigger value="permissions">Permissions</TabsTrigger>
                        <TabsTrigger value="members" disabled={isRootRole}>
                            Members
                        </TabsTrigger>
                    </TabsList>
                    <form id="role-editor-form">
                        <TabsContent value="display">
                            <Controller
                                control={form.control}
                                name="name"
                                render={({ field, fieldState }) => (
                                    <Field aria-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="guild-settings-role-editor-field-name">
                                            Role Name
                                        </FieldLabel>
                                        <Input
                                            id="guild-settings-role-editor-field-name"
                                            aria-invalid={fieldState.invalid}
                                            autoComplete="off"
                                            placeholder="Role-Name"
                                            {...field}
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                        </TabsContent>
                        <TabsContent value="permissions" className="flex flex-col space-y-6 overflow-auto">
                            <div className="flex items-center justify-between">
                                <h1>General Guild Permissions</h1>
                                <Button onClick={clearPermissions} variant="outline" size="sm">
                                    <RotateCcwKeyIcon />
                                    Clear Permissions
                                </Button>
                            </div>
                            <div className="h-full flex-col space-y-3 overflow-auto">
                                {permissionsConfig.map((pc) => (
                                    <Controller
                                        key={pc.name}
                                        control={form.control}
                                        name={pc.name}
                                        render={({ field, fieldState }) => (
                                            <Field aria-invalid={fieldState.invalid}>
                                                <Item
                                                    size="xs"
                                                    variant="outline"
                                                    className="border-2 has-[[aria-checked=true]]:bg-input/30"
                                                >
                                                    <ItemContent>
                                                        <ItemTitle>{pc.label}</ItemTitle>
                                                        <ItemDescription>{pc.description}</ItemDescription>
                                                    </ItemContent>
                                                    <ItemActions>
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </ItemActions>
                                                </Item>
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />
                                ))}
                            </div>
                        </TabsContent>
                    </form>
                    <TabsContent value="members">
                        <GuildSettingsRoleMembersEditor roleId={role.id} guildId={role.guildId} />
                    </TabsContent>
                </Tabs>
                <SettingsDialogUnsavedChanges
                    isVisible={form.formState.isDirty}
                    onDiscard={resetForm}
                    onSave={handleSaveChanges}
                />
            </div>
        </ScrollArea>
    );
}
