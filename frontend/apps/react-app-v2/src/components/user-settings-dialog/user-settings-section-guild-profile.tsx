import { SettingsDialogContentSection } from "../settings-dialog/settings-dialog-content-section";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select";
import { useEffect, useState } from "react";
import { GuildMemberType } from "@/lib/types/types";
import { UploadWrapper, useCloudinary } from "@/hooks/use-cloudinary";
import { zodResolver } from "@hookform/resolvers/zod";
import { CastleIcon, EarthIcon, UploadIcon } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { SettingsDialogUnsavedChanges } from "../settings-dialog/settings-dialog-unsaved-changes";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSet } from "../ui/field";
import { Button } from "../ui/button";
import { UserCard } from "../user-card";
import { Input } from "../ui/input";
import { useUpdateGuildMemberMutation } from "@/lib/react-query/mutations/update-guild-member-mutation";
import { UpdateGuildProfileFormType } from "./types/user-settings-dialog-types";
import { updateGuildProfileFormSchema } from "./zod-validation/user-settings-form-validation";
import { useGuildProfileQuery } from "@/lib/react-query/queries/profile-query";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../ui/empty";
import { useRouter } from "@tanstack/react-router";
import { useGuilds } from "@/lib/zustand/stores/guild-store";
import { Dialogs, dialogUIStoreActions } from "@/lib/zustand/stores/dialog-ui-store";

export function UserSettingsGuildProfileSection({ userId }: { userId: string }) {
    const guildsArray = useGuilds();
    const [selectedGuildId, setSelectedGuildId] = useState(guildsArray.length ? guildsArray[0].id : "");
    const router = useRouter();
    const guildProfile = useGuildProfileQuery({
        guildId: selectedGuildId,
        memberId: userId,
        enabled: !!guildsArray.length,
    });

    function handleGuildBrowserClick() {
        router.navigate({ to: "/app/guild-browser" });
    }

    return (
        <SettingsDialogContentSection
            title="Guild Profiles"
            description="Customise your appearance for each of your guilds."
        >
            {guildsArray.length ? (
                <Select value={selectedGuildId} defaultValue={guildsArray[0].id} onValueChange={setSelectedGuildId}>
                    <Field>
                        <FieldLabel>Choose a Guild</FieldLabel>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a guild" />
                        </SelectTrigger>
                    </Field>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Guilds</SelectLabel>
                            {guildsArray.map((g) => (
                                <SelectItem key={g.id} value={g.id}>
                                    {g.name}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            ) : (
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <CastleIcon />
                        </EmptyMedia>
                        <EmptyTitle>No Guilds Available</EmptyTitle>
                        <EmptyDescription>
                            It doesn't look like you've joined any guilds, you can do so by visiting the guild browser
                            or creating your own with the buttons below.
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent className="flex-row justify-center gap-2">
                        <Button variant="outline" onClick={() => dialogUIStoreActions.openDialog(Dialogs.CreateGuild)}>
                            <CastleIcon />
                            <span>Create Guild</span>
                        </Button>
                        <Button variant="outline" onClick={handleGuildBrowserClick}>
                            <EarthIcon />
                            <span>Guild Browser</span>
                        </Button>
                    </EmptyContent>
                </Empty>
            )}
            {guildProfile && <GuildProfileEditor guildProfile={guildProfile} />}
        </SettingsDialogContentSection>
    );
}

type UserSettingsGuildProfileSectionProps = {
    guildProfile: GuildMemberType;
};

export function GuildProfileEditor({ guildProfile }: UserSettingsGuildProfileSectionProps) {
    const { mutate: updateGuildMember } = useUpdateGuildMemberMutation();
    const avatarCloudinary = useCloudinary();
    const bannerCloudinary = useCloudinary();

    const form = useForm<UpdateGuildProfileFormType>({
        resolver: zodResolver(updateGuildProfileFormSchema),
        defaultValues: {
            nickname: guildProfile.displayName,
        },
    });

    useEffect(() => {
        resetForm();
    }, [guildProfile]);

    if (!guildProfile) {
        return null;
    }

    function handleSaveChanges() {
        form.handleSubmit((values: UpdateGuildProfileFormType) => {
            const payload = {
                ...values,
                id: guildProfile.id,
                guildId: guildProfile.guildId,
                avatar: guildProfile.avatar,
                banner: guildProfile.banner,
            };
            if (avatarCloudinary.attachments.length) {
                payload.avatar = avatarCloudinary.attachments[0].id;
            }
            if (bannerCloudinary.attachments.length) {
                payload.banner = bannerCloudinary.attachments[0].id;
            }
            updateGuildMember(payload);
        })();
    }

    function resetForm() {
        form.reset({ nickname: guildProfile.displayName });
        bannerCloudinary.clearAttachments();
        avatarCloudinary.clearAttachments();
    }

    const attachmentsDetected = !!(avatarCloudinary.attachments.length || bannerCloudinary.attachments.length);

    return (
        <>
            <div className="flex space-x-6">
                <form
                    id="guild-profile-editor-form"
                    onSubmit={handleSaveChanges}
                    className="flex w-full flex-col space-y-6"
                >
                    <FieldSet>
                        <FieldGroup>
                            <Controller
                                name="nickname"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="guild-profile-editor-field-display-name">
                                            Nickname
                                        </FieldLabel>
                                        <Input
                                            id="guild-profile-editor-field-display-name"
                                            placeholder={guildProfile.displayName}
                                            aria-invalid={fieldState.invalid}
                                            autoComplete="off"
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
                                    <Button variant="outline" type="button" size="sm">
                                        Remove Avatar
                                    </Button>
                                </div>
                                <FieldDescription>
                                    Recommended: Square image, at least 128x128 pixels. Max file size: 10MB.
                                </FieldDescription>
                            </Field>
                            <Field>
                                <FieldLabel>Banner</FieldLabel>
                                <div className="flex items-center space-x-3">
                                    <Button onClick={bannerCloudinary.onClick} type="button" size="sm">
                                        <UploadIcon />
                                        Change Banner
                                    </Button>
                                    <Button variant="outline" type="button" size="sm">
                                        Remove Banner
                                    </Button>
                                </div>
                                <FieldDescription>Recommended: 600x200 pixels. Max file size: 10MB.</FieldDescription>
                            </Field>
                        </FieldGroup>
                    </FieldSet>
                </form>
                <UserCard
                    displayName={guildProfile.displayName}
                    avatar={guildProfile.avatar}
                    banner={guildProfile.banner}
                    avatarPreview={avatarCloudinary.attachments.length ? avatarCloudinary.attachments[0].preview : null}
                    bannerPreview={bannerCloudinary.attachments.length ? bannerCloudinary.attachments[0].preview : null}
                    onAvatarMutate={avatarCloudinary.onClick}
                    onBannerMutate={bannerCloudinary.onClick}
                    roleIds={guildProfile.roles}
                    guildId={guildProfile.guildId}
                />
                <UploadWrapper id="user-guild-profile-avatar" ref={avatarCloudinary.setRef} />
                <UploadWrapper id="user-guild-profile-banner" ref={bannerCloudinary.setRef} />
            </div>
            <SettingsDialogUnsavedChanges
                isVisible={attachmentsDetected || form.formState.isDirty}
                onDiscard={resetForm}
                onSave={handleSaveChanges}
            />
        </>
    );
}
