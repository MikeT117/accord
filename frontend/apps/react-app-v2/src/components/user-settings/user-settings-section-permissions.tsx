import { Switch } from "../ui/switch";
import { useForm } from "react-hook-form";
import { SettingsDialogUnsavedChanges } from "../settings-dialog/settings-dialog-unsaved-changes";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "../ui/form";
import { SettingsDialogContentSection } from "../settings-dialog/settings-dialog-content-section";
import { useUpdateUserMutation } from "@/lib/react-query/mutations/update-user-mutation";
import { generatePublicFlagsNumber, generatePublicFlagsObj } from "@/lib/authorisation/permissions";

type UserSettingsPermissionsSectionProps = {
    avatar?: string | null;
    banner?: string | null;
    displayName: string;
    publicFlags: number;
};

export function UserSettingsPermissionsSection({
    publicFlags,
    displayName,
    avatar,
    banner,
}: UserSettingsPermissionsSectionProps) {
    const { mutate: updateUser } = useUpdateUserMutation({ onSuccess: resetForm });

    const publicFlagsObj = generatePublicFlagsObj(publicFlags);

    const form = useForm<{ allowFriendRequests: boolean; allowGuildMemberDMs: boolean }>({
        defaultValues: publicFlagsObj,
        values: publicFlagsObj,
    });

    async function handleSaveChanges() {
        form.handleSubmit((values) =>
            updateUser({
                displayName,
                publicFlags: generatePublicFlagsNumber(values),
                avatarId: avatar,
                bannerId: banner,
            }),
        )();
    }

    function resetForm() {
        form.reset(publicFlagsObj);
    }

    return (
        <SettingsDialogContentSection title="Account Permissions" description="Manage account communication flags.">
            <Form {...form}>
                <form className="space-y-3">
                    <FormField
                        control={form.control}
                        name="allowFriendRequests"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 has-[[aria-checked=true]]:bg-muted">
                                <div className="space-y-0.5">
                                    <FormLabel>Allow Friend Requests</FormLabel>
                                    <FormDescription className="text-xs">
                                        Toggling this allows any user to send you a friend request.
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="allowGuildMemberDMs"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 has-[[aria-checked=true]]:bg-muted">
                                <div className="space-y-0.5">
                                    <FormLabel>Allow Guild Member Direct Messages</FormLabel>
                                    <FormDescription className="text-xs">
                                        Toggling this allows members of mutual servers to message you without being
                                        friends.
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </form>
            </Form>
            <SettingsDialogUnsavedChanges
                isVisible={form.formState.isDirty}
                onDiscard={resetForm}
                onSave={handleSaveChanges}
            />
        </SettingsDialogContentSection>
    );
}
