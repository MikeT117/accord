import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { SettingsDialogUnsavedChanges } from "../settings-dialog/settings-dialog-unsaved-changes";
import { SettingsDialogContentSection } from "../settings-dialog/settings-dialog-content-section";
import { updateUserFormSchema } from "./user-settings-form-validation";
import type { UpdateUserFormType } from "./user-settings-dialog-types";
import { useUpdateUserMutation } from "@/lib/react-query/mutations/update-user-mutation";
import { useCloudinary } from "@/hooks/use-cloudinary";
import { UploadIcon } from "lucide-react";
import { UserProfilePreview } from "./user-settings-profile-preview";
import { Button } from "../ui/button";

type UserSettingsOverviewSectionProps = {
    avatar?: string | null;
    banner?: string | null;
    displayName: string;
    publicFlags: number;
};

export function UserSettingsOverviewSection({
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
            const payload = { ...values, avatarId: avatar, bannerId: banner };
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
                <Card className="grow">
                    <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>Update your display name, avatar and banner.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex space-x-6">
                        <Form {...form}>
                            <div className="flex flex-col space-y-6 ">
                                <FormField
                                    control={form.control}
                                    name="displayName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Display Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Display name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormItem>
                                    <FormLabel>Avatar</FormLabel>
                                    <div className="flex items-center space-x-3">
                                        <Button onClick={avatarCloudinary.onFileUploadClick}>
                                            <UploadIcon />
                                            Change Avatar
                                        </Button>
                                        <Button variant="outline">Remove Avatar</Button>
                                    </div>
                                    <FormDescription>
                                        Recommended: Square image, at least 128x128 pixels. Max file size: 8MB.
                                    </FormDescription>
                                </FormItem>
                                <FormItem>
                                    <FormLabel>Banner Image</FormLabel>
                                    <div className="flex space-x-3">
                                        <Button onClick={bannerCloudinary.onFileUploadClick}>
                                            <UploadIcon />
                                            Change Banner
                                        </Button>
                                        <Button variant="outline">Remove Banner</Button>
                                    </div>
                                    <FormDescription>Recommended: 600x200 pixels. Max file size: 8MB.</FormDescription>
                                </FormItem>
                            </div>
                        </Form>
                        <UserProfilePreview
                            displayName={displayName}
                            avatar={avatar}
                            banner={banner}
                            avatarPreview={
                                avatarCloudinary.attachments.length ? avatarCloudinary.attachments[0].preview : null
                            }
                            bannerPreview={
                                bannerCloudinary.attachments.length ? bannerCloudinary.attachments[0].preview : null
                            }
                            onAvatarMutate={avatarCloudinary.onFileUploadClick}
                            onBannerMutate={bannerCloudinary.onFileUploadClick}
                        />
                    </CardContent>
                </Card>
            </div>
            <SettingsDialogUnsavedChanges
                isVisible={attachmentsDetected || form.formState.isDirty}
                onDiscard={resetForm}
                onSave={handleSaveChanges}
            />
            <avatarCloudinary.UploadWrapper id="user-avatar" />
            <bannerCloudinary.UploadWrapper id="user-banner" />
        </SettingsDialogContentSection>
    );
}
