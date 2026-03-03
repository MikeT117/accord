import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateGuildChannelMutation } from "@/lib/react-query/mutations/update-guild-channel-mutation";
import { SettingsDialogUnsavedChanges } from "../settings-dialog/settings-dialog-unsaved-changes";
import { SettingsDialogContentSection } from "../settings-dialog/settings-dialog-content-section";
import { Field, FieldError, FieldLabel, FieldGroup, FieldSet } from "../ui/field";
import { UpdateGuildChannelFormType } from "./types/guild-channel-settings-dialog-types";
import { updateGuildChannelFormSchema } from "./zod-validation/guild-channel-settings-form-validation";

type GuildChannelSettingsOverviewSectionProps = {
    id: string;
    name: string;
    parentId?: string | null;
    topic: string;
};

export function GuildChannelSettingsOverviewSection({
    id,
    name,
    parentId,
    topic,
}: GuildChannelSettingsOverviewSectionProps) {
    const { mutate: updateGuildChannel } = useUpdateGuildChannelMutation({ onSuccess: resetForm });

    const form = useForm<UpdateGuildChannelFormType>({
        resolver: zodResolver(updateGuildChannelFormSchema),
        defaultValues: {
            name,
            topic,
        },
    });

    function onSubmit(values: UpdateGuildChannelFormType) {
        updateGuildChannel({ ...values, id, parentId });
    }

    function resetForm() {
        form.reset({ name, topic });
    }

    return (
        <SettingsDialogContentSection title="Channel Overview" description="Manage channel properties.">
            <form className="w-full" id="channel-settings-form" onSubmit={form.handleSubmit(onSubmit)}>
                <FieldSet>
                    <FieldGroup>
                        <Controller
                            control={form.control}
                            name="name"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="guild-channel-settings-field-display-name">Name</FieldLabel>
                                    <Input
                                        id="guild-channel-settings-field-display-name"
                                        aria-invalid={fieldState.invalid}
                                        placeholder="Give your channel a name"
                                        {...field}
                                    />
                                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                        <Controller
                            control={form.control}
                            name="topic"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="guild-channel-settings-field-topic">Topic</FieldLabel>
                                    <Textarea
                                        id="guild-channel-settings-field-topic"
                                        aria-invalid={fieldState.invalid}
                                        placeholder="Give your channel a topic"
                                        {...field}
                                        rows={4}
                                    />
                                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                    </FieldGroup>
                </FieldSet>
            </form>
            <SettingsDialogUnsavedChanges
                isVisible={form.formState.isDirty}
                onDiscard={resetForm}
                onSave={form.handleSubmit(onSubmit)}
            />
        </SettingsDialogContentSection>
    );
}
