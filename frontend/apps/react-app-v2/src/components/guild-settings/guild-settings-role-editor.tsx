import { Switch } from "../ui/switch";
import { useForm } from "react-hook-form";
import { SettingsDialogUnsavedChanges } from "../settings-dialog/settings-dialog-unsaved-changes";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "../ui/form";
import type { GuildRoleType, Snapshot } from "@/lib/types/types";
import { useUpdateGuildRoleMutation } from "@/lib/react-query/mutations/update-role-mutation";
import { generateRolePermissionsNumber, generateRolePermissionsObj } from "@/lib/authorisation/permissions";
import type { UpdateGuildRoleFormType } from "./guild-settings-dialog-types";
import { Input } from "../ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateGuildRoleFormSchema } from "./guild-settings-form-validation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { GuildSettingsRoleMembersEditor } from "./guild-settings-role-members-editor";
import { Button } from "../ui/button";

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
        label: "Server Admin",
        description: "Grants members server admin rights.",
    },
    {
        name: "ManageChannelMessage",
        label: "Manage Messages",
        description:
            "Grants the ability to manage message in channels, including deleting other users messages, marking as spam etc.",
    },
    {
        name: "ManageGuild",
        label: "Manage Server",
        description:
            " Grants members the ability to manage this server, allowing them to create & modify channels, roles, role assignments, modify server info etc.",
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
        label: "View Server Members",
        description: "Grants members the ability to view server members list.",
    },
] as const;

type GuildSettingsRolesEditorProps = {
    role: Snapshot<GuildRoleType>;
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
            console.log({ name, permissions });
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
        <div className="relative h-full w-full space-y-3 p-6">
            <Tabs defaultValue={defaultTab} className="space-y-1.5 ">
                <div className="flex flex-col space-y-1">
                    <h2 className="text-2xl font-semibold">Role Editor - {role.name}</h2>
                    <p className="text-sm text-muted-foreground">
                        Edit role detail such as permissions, member assignments and name.
                    </p>
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

                <Form {...form}>
                    <TabsContent value="display">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </TabsContent>
                    <TabsContent value="permissions" className="flex flex-col space-y-6">
                        <div className="flex items-center justify-between">
                            <h1>General Server Permissions</h1>
                            <Button onClick={clearPermissions} variant="link" size="sm" className="px-0">
                                Clear Permissions
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {permissionsConfig.map((pc) => (
                                <FormField
                                    key={pc.name}
                                    control={form.control}
                                    name={pc.name}
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 has-[[aria-checked=true]]:bg-muted">
                                            <div className="space-y-0.5">
                                                <FormLabel>{pc.label}</FormLabel>
                                                <FormDescription className="text-xs">{pc.description}</FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            ))}
                        </div>
                    </TabsContent>
                </Form>
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
    );
}
