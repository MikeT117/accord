import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { useCloudinary } from "@/hooks/use-cloudinary";
import { useCreateGuildMutation } from "@/lib/react-query/mutations/create-guild-mutation";
import { AvatarWithFallback } from "../avatar-with-fallback";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSet } from "../ui/field";
import { createGuildFormSchema } from "./zod-validation/guild-creator-form-validation";
import { CreateGuildFormType } from "./types/create-guild-dialog-types";

type CreateGuildDialogProps = { onClose: () => void };

export function CreateGuildDialog({ onClose }: CreateGuildDialogProps) {
    const { UploadWrapper, onFileUploadClick, attachments, clearAttachments } = useCloudinary();
    const { mutate: createGuild } = useCreateGuildMutation({ onSuccess: handleSuccess });
    const form = useForm<CreateGuildFormType>({
        resolver: zodResolver(createGuildFormSchema),
        defaultValues: {
            name: "",
        },
    });

    function handleSuccess() {
        clearAttachments();
        onClose();
    }

    function onSubmit(values: CreateGuildFormType) {
        const payload: Parameters<typeof createGuild>[0] = {
            name: values.name,
        };

        if (attachments.length) {
            payload.iconId = attachments[0].id;
        }

        createGuild(payload);
    }
    return (
        <Dialog defaultOpen={true} onOpenChange={onClose} modal>
            <DialogContent>
                <DialogHeader className="items-center">
                    <DialogTitle>Create a Guild</DialogTitle>
                    <DialogDescription className="text-center">
                        Give your guild a name and an icon, these can be changed anytime later.
                    </DialogDescription>
                    <AvatarWithFallback
                        size="xxxl"
                        onMutate={onFileUploadClick}
                        preview={attachments.length !== 0 ? attachments[0].preview : null}
                        fallback="Guild Icon"
                    />
                </DialogHeader>
                <form id="create-guild-form" onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldSet>
                        <FieldGroup>
                            <Controller
                                control={form.control}
                                name="name"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="create-guild-field-name">Name</FieldLabel>
                                        <Input
                                            id="create-guild-field-name"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="Give your guild a name"
                                            autoComplete="off"
                                            {...field}
                                        />
                                        <FieldDescription>This is how people will find your guild.</FieldDescription>
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                            <UploadWrapper id="guild-creator" />
                        </FieldGroup>
                    </FieldSet>
                </form>
                <DialogFooter>
                    <Button onClick={onClose} variant="outline">
                        Cancel
                    </Button>
                    <Button type="submit" form="create-guild-form">
                        Create
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
