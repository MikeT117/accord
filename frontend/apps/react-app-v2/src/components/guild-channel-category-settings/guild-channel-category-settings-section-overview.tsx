import { Input } from "../ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { useUpdateGuildChannelMutation } from "@/lib/react-query/mutations/update-guild-channel-mutation";
import { SettingsDialogUnsavedChanges } from "../settings-dialog/settings-dialog-unsaved-changes";
import { SettingsDialogContentSection } from "../settings-dialog/settings-dialog-content-section";
import { updateGuildCategoryChannelFormSchema } from "./guild-channel-category-settings-form-validation";
import type { UpdateGuildCategoryChannelFormType } from "./guild-channel-category-settings-dialog-types";

type GuildChannelSettingsOverviewSectionProps = {
    id: string;
    name: string;
};

export function GuildCategoryChannelSettingsOverviewSection({ id, name }: GuildChannelSettingsOverviewSectionProps) {
    const form = useForm<UpdateGuildCategoryChannelFormType>({
        resolver: zodResolver(updateGuildCategoryChannelFormSchema),
        defaultValues: {
            name,
        },
    });

    const { mutate: updateGuildChannel } = useUpdateGuildChannelMutation({ onSuccess: resetForm });

    function handleSaveChanges() {
        form.handleSubmit((values: UpdateGuildCategoryChannelFormType) =>
            updateGuildChannel({
                ...values,
                id,
                parentId: null,
            }),
        )();
    }

    function resetForm() {
        form.reset({ name });
    }

    return (
        <SettingsDialogContentSection title="Category Overview" description="Manage category properties.">
            <Form {...form}>
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Give your category a name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </Form>
            <SettingsDialogUnsavedChanges
                isVisible={form.formState.isDirty}
                onDiscard={resetForm}
                onSave={handleSaveChanges}
            />
        </SettingsDialogContentSection>
    );
}
