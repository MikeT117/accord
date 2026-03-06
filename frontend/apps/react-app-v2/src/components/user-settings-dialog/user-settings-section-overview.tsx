import { Input } from "../ui/input";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SettingsDialogUnsavedChanges } from "../settings-dialog/settings-dialog-unsaved-changes";
import { SettingsDialogContentSection } from "../settings-dialog/settings-dialog-content-section";
import { updateUserFormSchema } from "./zod-validation/user-settings-form-validation";
import type { UpdateUserFormType } from "./types/user-settings-dialog-types";
import { useUpdateUserMutation } from "@/lib/react-query/mutations/update-user-mutation";
import { UploadWrapper, useCloudinary } from "@/hooks/use-cloudinary";
import { UploadIcon } from "lucide-react";
import { UserCard } from "@/components/user-card";
import { Button } from "../ui/button";
import { Field, FieldDescription, FieldError, FieldSet, FieldLabel, FieldGroup } from "../ui/field";

type UserSettingsOverviewSectionProps = {
    userId: string;
    avatar?: string | null;
    banner?: string | null;
    displayName: string;
    publicFlags: number;
};

export function UserSettingsOverviewSection({
    userId,
    avatar,
    banner,
    displayName,
    publicFlags,
}: UserSettingsOverviewSectionProps) {
    const form = useForm<UpdateUserFormType>({
        resolver: zodResolver(updateUserFormSchema),
        defaultValues: {
            displayName,
            publicFlags,
        },
    });

    const avatarCloudinary = useCloudinary();
    const bannerCloudinary = useCloudinary();
    const attachmentsDetected = !!(avatarCloudinary.attachments.length || bannerCloudinary.attachments.length);

    const { mutate: updateUser } = useUpdateUserMutation({ onSuccess: resetForm });

    function handleSaveChanges() {
        form.handleSubmit((values: UpdateUserFormType) => {
            const payload = { ...values, id: userId, avatarId: avatar, bannerId: banner };
            if (avatarCloudinary.attachments.length) {
                payload.avatarId = avatarCloudinary.attachments[0].id;
            }
            if (bannerCloudinary.attachments.length) {
                payload.bannerId = bannerCloudinary.attachments[0].id;
            }
            updateUser(payload);
        })();
    }

    function resetForm() {
        form.reset({ displayName, publicFlags });
        bannerCloudinary.clearAttachments();
        avatarCloudinary.clearAttachments();
    }

    return (
        <SettingsDialogContentSection title="Account Overview" description="Manage account properties.">
            <div className="flex space-x-6">
                <form className="w-full" id="user-settings-form">
                    <FieldSet>
                        <FieldGroup>
                            <Controller
                                control={form.control}
                                name="displayName"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="user-settings-field-display-name">Display Name</FieldLabel>
                                        <Input
                                            id="user-settings-field-display-name"
                                            placeholder="Display name"
                                            autoComplete="off"
                                            aria-invalid={fieldState.invalid}
                                            {...field}
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                            <Field>
                                <FieldLabel>Avatar</FieldLabel>
                                <div className="flex items-center space-x-3">
                                    <Button onClick={avatarCloudinary.onClick} type="button" size="sm">
                                        <UploadIcon />
                                        Change Avatar
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        Remove Avatar
                                    </Button>
                                </div>
                                <FieldDescription>
                                    Recommended: Square image, at least 128x128 pixels. Max file size: 10MB.
                                </FieldDescription>
                            </Field>
                            <Field>
                                <FieldLabel>Banner</FieldLabel>
                                <div className="flex space-x-3">
                                    <Button onClick={bannerCloudinary.onClick} type="button" size="sm">
                                        <UploadIcon />
                                        Change Banner
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        Remove Banner
                                    </Button>
                                </div>
                                <FieldDescription>Recommended: 600x200 pixels. Max file size: 10MB.</FieldDescription>
                            </Field>
                        </FieldGroup>
                    </FieldSet>
                </form>
                <UserCard
                    displayName={displayName}
                    avatar={avatar}
                    banner={banner}
                    avatarPreview={avatarCloudinary.attachments.length ? avatarCloudinary.attachments[0].preview : null}
                    bannerPreview={bannerCloudinary.attachments.length ? bannerCloudinary.attachments[0].preview : null}
                    onAvatarMutate={avatarCloudinary.onClick}
                    onBannerMutate={bannerCloudinary.onClick}
                />
            </div>
            <SettingsDialogUnsavedChanges
                isVisible={attachmentsDetected || form.formState.isDirty}
                onDiscard={resetForm}
                onSave={handleSaveChanges}
            />
            <UploadWrapper id="user-avatar" ref={avatarCloudinary.setRef} />
            <UploadWrapper id="user-banner" ref={bannerCloudinary.setRef} />
        </SettingsDialogContentSection>
    );
}
