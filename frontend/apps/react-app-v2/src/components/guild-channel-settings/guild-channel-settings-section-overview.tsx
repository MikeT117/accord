import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { updateGuildChannelFormSchema } from "./guild-channel-settings-form-validation";
import type { UpdateGuildChannelFormType } from "./guild-channel-settings-dialog-types";
import { useUpdateGuildChannelMutation } from "@/lib/react-query/mutations/update-guild-channel-mutation";
import { SettingsDialogUnsavedChanges } from "../settings-dialog/settings-dialog-unsaved-changes";
import { SettingsDialogContentSection } from "../settings-dialog/settings-dialog-content-section";

type GuildChannelSettingsOverviewSectionProps = {
    id: string;
    name: string;
    topic: string;
    parentId: string | null;
};

export function GuildChannelSettingsOverviewSection({
    id,
    name,
    parentId,
    topic,
}: GuildChannelSettingsOverviewSectionProps) {
    const form = useForm<UpdateGuildChannelFormType>({
        resolver: zodResolver(updateGuildChannelFormSchema),
        defaultValues: {
            name,
            topic,
        },
    });

    const { mutate: updateGuildChannel } = useUpdateGuildChannelMutation({ onSuccess: resetForm });

    function handleSaveChanges() {
        form.handleSubmit((values: UpdateGuildChannelFormType) =>
            updateGuildChannel({
                ...values,
                id,
                parentId,
            })
        )();
    }

    function resetForm() {
        form.reset({ name, topic });
    }

    return (
        <SettingsDialogContentSection title="Channel Overview" description="Manage channel properties.">
            <Card>
                <CardHeader>
                    <CardTitle>Channel Information</CardTitle>
                    <CardDescription>Update your channel's name, topic, and description.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Form {...form}>
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Give your channel a name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="topic"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Topic</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Give your channel a topic" {...field} rows={4} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </Form>
                </CardContent>
            </Card>
            <SettingsDialogUnsavedChanges
                isVisible={form.formState.isDirty}
                onDiscard={resetForm}
                onSave={handleSaveChanges}
            />
        </SettingsDialogContentSection>
    );
}
