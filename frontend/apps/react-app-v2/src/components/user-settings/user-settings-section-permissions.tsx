import { Switch } from "../ui/switch";
import { Controller, useForm } from "react-hook-form";
import { SettingsDialogUnsavedChanges } from "../settings-dialog/settings-dialog-unsaved-changes";
import { SettingsDialogContentSection } from "../settings-dialog/settings-dialog-content-section";
import { useUpdateUserMutation } from "@/lib/react-query/mutations/update-user-mutation";
import { generatePublicFlagsNumber, generatePublicFlagsObj } from "@/lib/authorisation/permissions";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "../ui/item";
import { MessageCircleIcon, UserCheck2Icon } from "lucide-react";
import { UserPermissionsFormType } from "./types/user-settings-dialog-types";
import { Field, FieldError } from "../ui/field";
import { JSX } from "react";

type UserSettingsPermissionsSectionProps = {
    userId: string;
    avatar?: string | null;
    banner?: string | null;
    displayName: string;
    publicFlags: number;
};

const userPermissions: { id: keyof UserPermissionsFormType; title: string; description: string; icon: JSX.Element }[] =
    [
        {
            id: "allowFriendRequests",
            title: "Allow Friend Requests",
            description: "Toggling this allows any user to send you a friend request.",
            icon: <UserCheck2Icon />,
        },
        {
            id: "allowGuildMemberDMs",
            title: "Allow Guild Member Direct Messages",
            description: "Toggling this allows members of mutual guilds to message you without being friends.",
            icon: <MessageCircleIcon />,
        },
    ];

export function UserSettingsPermissionsSection({
    userId,
    publicFlags,
    displayName,
    avatar,
    banner,
}: UserSettingsPermissionsSectionProps) {
    const { mutate: updateUser } = useUpdateUserMutation({ onSuccess: resetForm });
    const publicFlagsObj = generatePublicFlagsObj(publicFlags);
    const form = useForm<UserPermissionsFormType>({
        defaultValues: publicFlagsObj,
        values: publicFlagsObj,
    });

    async function onSubmit(values: UserPermissionsFormType) {
        updateUser({
            id: userId,
            displayName,
            publicFlags: generatePublicFlagsNumber(values),
            avatarId: avatar,
            bannerId: banner,
        });
    }

    function resetForm() {
        form.reset(publicFlagsObj);
    }

    return (
        <SettingsDialogContentSection title="Account Permissions" description="Manage account communication flags.">
            <form id="user-accont-permissions" className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
                {userPermissions.map((permission) => (
                    <Controller
                        key={permission.id}
                        control={form.control}
                        name={permission.id}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <Item
                                    size="xs"
                                    variant="outline"
                                    className="border-2 has-[[aria-checked=true]]:bg-input/30"
                                >
                                    <ItemMedia variant="icon">{permission.icon}</ItemMedia>
                                    <ItemContent>
                                        <ItemTitle>{permission.title}</ItemTitle>
                                        <ItemDescription>{permission.description}</ItemDescription>
                                    </ItemContent>
                                    <ItemActions>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </ItemActions>
                                </Item>
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                ))}
            </form>
            <SettingsDialogUnsavedChanges
                isVisible={form.formState.isDirty}
                onDiscard={resetForm}
                onSave={form.handleSubmit(onSubmit)}
            />
        </SettingsDialogContentSection>
    );
}
