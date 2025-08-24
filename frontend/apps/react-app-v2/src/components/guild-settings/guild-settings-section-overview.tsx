import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { SettingsDialogUnsavedChanges } from "../settings-dialog/settings-dialog-unsaved-changes";
import { SettingsDialogContentSection } from "../settings-dialog/settings-dialog-content-section";
import { useUpdateGuildMutation } from "@/lib/react-query/mutations/update-guild-mutation";
import type { UpdateGuildFormType } from "./guild-settings-dialog-types";
import { updateGuildFormSchema } from "./guild-settings-form-validation";
import { Switch } from "../ui/switch";
import { useCloudinary } from "@/hooks/use-cloudinary";
import { useGuildCategoriesQuery } from "@/lib/react-query/queries/guild-category-query";
import { GuildCategorySelect } from "./guild-category-select";
import { GuildProfilePreview } from "./guild-profile-preview";
import { Button } from "../ui/button";
import { UploadIcon } from "lucide-react";
import type { GuildType, Snapshot } from "@/lib/types/types";

type GuildSettingsOverviewSectionProps = {
    guild: Snapshot<GuildType>;
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
    }

    if (!guildCategories) {
        return null;
    }

    return (
        <SettingsDialogContentSection title="Server Overview" description="Manage Server properties.">
            <div className="flex space-x-6">
                <Form {...form}>
                    <div className="flex w-full flex-col space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Server Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Give your server a name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Server Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Give your server a description" {...field} rows={4} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormItem>
                            <FormLabel>Server Icon</FormLabel>
                            <div className="flex items-center space-x-3">
                                <Button onClick={iconCloudinary.onFileUploadClick} size="sm">
                                    <UploadIcon />
                                    Change Icon
                                </Button>
                                <Button variant="outline" size="sm">
                                    Remove Avatar
                                </Button>
                            </div>
                            <FormDescription>
                                Recommended: Square image, at least 128x128 pixels. Max file size: 8MB.
                            </FormDescription>
                        </FormItem>
                        <FormItem>
                            <FormLabel>Server Banner</FormLabel>
                            <div className="flex space-x-3">
                                <Button onClick={bannerCloudinary.onFileUploadClick} size="sm">
                                    <UploadIcon />
                                    Change Banner
                                </Button>
                                <Button variant="outline" size="sm">
                                    Remove Banner
                                </Button>
                            </div>
                            <FormDescription>Recommended: 600x200 pixels. Max file size: 8MB.</FormDescription>
                        </FormItem>
                        <FormField
                            control={form.control}
                            name="discoverable"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 has-[[aria-checked=true]]:bg-muted">
                                    <div className="space-y-0.5">
                                        <FormLabel>Private Server</FormLabel>
                                        <FormDescription className="text-xs">
                                            An invite will be required to join, server will not be visible in server
                                            browser.
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
                            name="guildCategoryId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Server Category</FormLabel>
                                    <FormControl>
                                        <GuildCategorySelect
                                            className="w-full"
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                </Form>
                <GuildProfilePreview
                    name={name}
                    description={description}
                    createdAt={guild.createdAt}
                    memberCount={guild.memberCount}
                    icon={guild.icon}
                    onIconMutate={iconCloudinary.onFileUploadClick}
                    iconPreview={iconCloudinary.attachments.length ? iconCloudinary.attachments[0].preview : null}
                    banner={guild.banner}
                    onBannerMutate={bannerCloudinary.onFileUploadClick}
                    bannerPreview={bannerCloudinary.attachments.length ? bannerCloudinary.attachments[0].preview : null}
                />
            </div>
            <SettingsDialogUnsavedChanges
                isVisible={form.formState.isDirty}
                onDiscard={resetForm}
                onSave={handleSaveChanges}
            />
            <iconCloudinary.UploadWrapper id="server-icon" />
            <bannerCloudinary.UploadWrapper id="server-banner" />
        </SettingsDialogContentSection>
    );
}
