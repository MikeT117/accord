import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SettingsDialogUnsavedChanges } from "../settings-dialog/settings-dialog-unsaved-changes";
import { SettingsDialogContentSection } from "../settings-dialog/settings-dialog-content-section";
import { useUpdateGuildMutation } from "@/lib/react-query/mutations/update-guild-mutation";
import { Switch } from "../ui/switch";
import { useCloudinary } from "@/hooks/use-cloudinary";
import { useGuildCategoriesQuery } from "@/lib/react-query/queries/guild-category-query";
import { GuildCategorySelect } from "./guild-category-select";
import { Button } from "../ui/button";
import { EarthIcon, UploadIcon } from "lucide-react";
import type { GuildType } from "@/lib/types/types";
import { GuildCard } from "../guild-card";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "../ui/item";
import { Field, FieldDescription, FieldError, FieldLabel, FieldSet } from "../ui/field";
import { UpdateGuildFormType } from "./types/guild-settings-dialog-types";
import { updateGuildFormSchema } from "./zod-validation/guild-settings-form-validation";

type GuildSettingsOverviewSectionProps = {
    guild: GuildType;
};

export function GuildSettingsOverviewSection({ guild }: GuildSettingsOverviewSectionProps) {
    const { mutate: updateGuild } = useUpdateGuildMutation({ onSuccess: resetForm });
    const guildCategories = useGuildCategoriesQuery();

    const iconCloudinary = useCloudinary();
    const bannerCloudinary = useCloudinary();

    const form = useForm<UpdateGuildFormType>({
        resolver: zodResolver(updateGuildFormSchema),
        defaultValues: {
            name: guild.name,
            description: guild.description,
            discoverable: guild.discoverable,
            guildCategoryId: guild.guildCategoryId,
        },
        values: {
            name: guild.name,
            description: guild.description,
            discoverable: guild.discoverable,
            guildCategoryId: guild.guildCategoryId,
        },
    });

    const name = form.formState.dirtyFields.name ? (form.watch("name") ?? "") : guild.name;
    const description = form.formState.dirtyFields.description ? (form.watch("description") ?? "") : guild.description;

    function handleSaveChanges() {
        form.handleSubmit((values: UpdateGuildFormType) => {
            const payload = { ...values, id: guild.id, iconId: guild.icon, bannerId: guild.banner };
            if (iconCloudinary.attachments.length) {
                payload.iconId = iconCloudinary.attachments[0].id;
            }
            if (bannerCloudinary.attachments.length) {
                payload.bannerId = bannerCloudinary.attachments[0].id;
            }
            updateGuild(payload);
        })();
    }

    function resetForm() {
        form.reset({
            name: guild.name,
            description: guild.description,
            discoverable: guild.discoverable,
            guildCategoryId: guild.guildCategoryId,
        });

        iconCloudinary.clearAttachments();
        bannerCloudinary.clearAttachments();
    }

    const isFormDirty =
        form.formState.isDirty || !!iconCloudinary.attachments.length || !!bannerCloudinary.attachments.length;

    if (!guildCategories) {
        return null;
    }

    return (
        <SettingsDialogContentSection title="Guild Overview" description="Manage guild properties.">
            <div className="flex space-x-6">
                <form id="guild-settings-form">
                    <FieldSet>
                        <Controller
                            control={form.control}
                            name="name"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="guild-creator-field-name">Name</FieldLabel>
                                    <Input
                                        id="guild-creator-field-name"
                                        aria-invalid={fieldState.invalid}
                                        autoComplete="off"
                                        placeholder="Give your guild a name"
                                        {...field}
                                    />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                        <Controller
                            control={form.control}
                            name="description"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="guild-creator-field-description">Description</FieldLabel>
                                    <Textarea
                                        id="guild-creator-field-description"
                                        aria-invalid={fieldState.invalid}
                                        autoComplete="off"
                                        placeholder="Give your guild a description"
                                        {...field}
                                    />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                        <Field>
                            <FieldLabel>Icon</FieldLabel>
                            <div className="flex items-center space-x-3">
                                <Button onClick={iconCloudinary.onFileUploadClick} size="sm" type="button">
                                    <UploadIcon />
                                    Change Icon
                                </Button>
                                <Button variant="outline" size="sm">
                                    Remove Avatar
                                </Button>
                            </div>
                            <FieldDescription>
                                Recommended: Square image, at least 128x128 pixels. Max file size: 8MB.
                            </FieldDescription>
                        </Field>
                        <Field>
                            <FieldLabel>Banner</FieldLabel>
                            <div className="flex space-x-3">
                                <Button onClick={bannerCloudinary.onFileUploadClick} size="sm" type="button">
                                    <UploadIcon />
                                    Change Banner
                                </Button>
                                <Button variant="outline" size="sm">
                                    Remove Banner
                                </Button>
                            </div>
                            <FieldDescription>Recommended: 600x200 pixels. Max file size: 8MB.</FieldDescription>
                        </Field>
                        <Controller
                            control={form.control}
                            name="discoverable"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <Item
                                        size="xs"
                                        variant="outline"
                                        className="border-2 has-[[aria-checked=true]]:bg-input/30"
                                    >
                                        <ItemMedia variant="icon">
                                            <EarthIcon />
                                        </ItemMedia>
                                        <ItemContent>
                                            <ItemTitle>Discoverable</ItemTitle>
                                            <ItemDescription>
                                                Enable discovery to allow users to join the guild without needing an
                                                invite, otherwise users may only join via an invite.
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
                        <Controller
                            control={form.control}
                            name="guildCategoryId"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="guild-category-field">Guild Category</FieldLabel>
                                    <GuildCategorySelect
                                        className="w-full"
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    />

                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                    </FieldSet>
                </form>

                <GuildCard
                    id={guild.id}
                    name={name}
                    description={description}
                    createdAt={guild.createdAt}
                    memberCount={guild.memberCount}
                    icon={guild.icon}
                    iconPreview={iconCloudinary.attachments.length ? iconCloudinary.attachments[0].preview : null}
                    banner={guild.banner}
                    bannerPreview={bannerCloudinary.attachments.length ? bannerCloudinary.attachments[0].preview : null}
                    onBannerMutate={bannerCloudinary.onFileUploadClick}
                    onIconMutate={iconCloudinary.onFileUploadClick}
                />
            </div>
            <SettingsDialogUnsavedChanges isVisible={isFormDirty} onDiscard={resetForm} onSave={handleSaveChanges} />
            <iconCloudinary.UploadWrapper id="server-icon" />
            <bannerCloudinary.UploadWrapper id="server-banner" />
        </SettingsDialogContentSection>
    );
}
