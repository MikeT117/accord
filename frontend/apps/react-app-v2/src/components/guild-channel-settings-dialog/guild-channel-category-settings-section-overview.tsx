import { Input } from "../ui/input";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateGuildChannelMutation } from "@/lib/react-query/mutations/update-guild-channel-mutation";
import { SettingsDialogUnsavedChanges } from "../settings-dialog/settings-dialog-unsaved-changes";
import { SettingsDialogContentSection } from "../settings-dialog/settings-dialog-content-section";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { UpdateGuildCategoryChannelFormType } from "./types/guild-channel-settings-dialog-types";
import { updateGuildCategoryChannelFormSchema } from "./zod-validation/guild-channel-settings-form-validation";

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

    function onSubmit(values: UpdateGuildCategoryChannelFormType) {
        updateGuildChannel({
            ...values,
            id,
            parentId: null,
        });
    }

    function resetForm() {
        form.reset({ name });
    }

    return (
        <SettingsDialogContentSection title="Category Overview" description="Manage category properties.">
            <form id="category-channel-overview-form" onSubmit={form.handleSubmit(onSubmit)}>
                <Controller
                    control={form.control}
                    name="name"
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="category-channel-overview-field-category-name">Name</FieldLabel>
                            <Input
                                id="category-channel-overview-field-category-name"
                                placeholder="Give your category a name"
                                aria-invalid={fieldState.invalid}
                                {...field}
                            />
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />
            </form>
            <SettingsDialogUnsavedChanges
                isVisible={form.formState.isDirty}
                onDiscard={resetForm}
                onSave={form.handleSubmit(onSubmit)}
            />
        </SettingsDialogContentSection>
    );
}
