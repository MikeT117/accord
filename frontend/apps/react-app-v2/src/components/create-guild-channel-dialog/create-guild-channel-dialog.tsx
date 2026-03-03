import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { useCreateGuildChannelMutation } from "@/lib/react-query/mutations/create-guild-channel-mutation";
import { GUILD_CHANNEL_TYPE } from "@/lib/zod-validation/channel-schema";
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Switch } from "../ui/switch";
import { Checkbox } from "../ui/checkbox";
import { BrickWallShieldIcon, CogIcon, ShieldCheckIcon, ShieldIcon } from "lucide-react";
import { useParams } from "@tanstack/react-router";
import type { ValueOf } from "@/lib/types/types";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "../ui/item";
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSet,
    FieldTitle,
} from "../ui/field";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "../ui/empty";
import { CreateGuildChannelFormType } from "./types/create-guild-channel-dialog-types";
import { createGuildChannelFormSchema } from "./zod-validation/guild-channel-creator-form-validation";
import { useGuildRoles } from "@/lib/zustand/stores/guild-store";
import { Dialogs, dialogUIStoreActions } from "@/lib/zustand/stores/dialog-ui-store";

const FORM_STAGE = {
    CHANNEL_DETAILS: 0,
    CHANNEL_ROLES: 1,
} as const;

const channelTypes = [
    {
        id: "GUILD_TEXT_CHANNEL",
        title: "Text Channel",
        description: "Send messages, images, emoji etc.",
    },
    {
        id: "GUILD_VOICE_CHANNEL",
        title: "Voice Channel",
        description: "Voice chat with friends.",
    },
];

type CreateGuildChannelDialogProps = {
    onClose: () => void;
};

export function CreateGuildChannelDialog({ onClose }: CreateGuildChannelDialogProps) {
    const { guildId } = useParams({ from: "/_auth/app/$guildId" });
    const [formStage, setFormStage] = useState<ValueOf<typeof FORM_STAGE>>(FORM_STAGE.CHANNEL_DETAILS);
    const { custom: customRoles } = useGuildRoles(guildId);
    const { mutate: createGuildChannel } = useCreateGuildChannelMutation();

    const form = useForm<CreateGuildChannelFormType>({
        resolver: zodResolver(createGuildChannelFormSchema),
        defaultValues: {
            name: "",
            isPrivate: false,
            roleIds: [],
            channelType: "GUILD_TEXT_CHANNEL",
        },
    });

    function handlePrevCancelClick() {
        if (formStage !== FORM_STAGE.CHANNEL_DETAILS) {
            setFormStage(FORM_STAGE.CHANNEL_DETAILS);
        } else {
            onClose();
        }
    }

    function onSubmit(values: CreateGuildChannelFormType) {
        if (formStage === FORM_STAGE.CHANNEL_DETAILS && form.getValues("isPrivate").valueOf()) {
            setFormStage(FORM_STAGE.CHANNEL_ROLES);
        } else {
            createGuildChannel(
                {
                    ...values,
                    guildId,
                    channelType: GUILD_CHANNEL_TYPE[values.channelType],
                },
                {
                    onSuccess: onClose,
                },
            );
        }
    }

    const nextButtonLabel = formStage === FORM_STAGE.CHANNEL_DETAILS && form.watch("isPrivate") ? "Next" : "Create";
    const prevButtonLabel = formStage === FORM_STAGE.CHANNEL_ROLES ? "Back" : "Cancel";

    return (
        <Dialog defaultOpen={true} onOpenChange={onClose} modal>
            <DialogContent>
                <DialogHeader className="items-center">
                    <DialogTitle>Create a Channel</DialogTitle>
                </DialogHeader>
                <form id="create-guild-channel-form" onSubmit={form.handleSubmit(onSubmit)}>
                    {formStage === FORM_STAGE.CHANNEL_DETAILS ? (
                        <FieldGroup>
                            <FieldSet>
                                <FieldLegend>Channel Type</FieldLegend>
                                <Controller
                                    name="channelType"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <RadioGroup
                                                name={field.name}
                                                value={field.value}
                                                onValueChange={field.onChange}
                                                aria-invalid={fieldState.invalid}
                                                defaultValue="GUILD_TEXT_CHANNEL"
                                            >
                                                {channelTypes.map((channelType) => (
                                                    <FieldLabel
                                                        key={channelType.id}
                                                        htmlFor={`create-guild-channel-form-radiogroup-${channelType.id}`}
                                                    >
                                                        <Field
                                                            orientation="horizontal"
                                                            data-invalid={fieldState.invalid}
                                                        >
                                                            <FieldContent>
                                                                <FieldTitle>{channelType.title}</FieldTitle>
                                                                <FieldDescription>
                                                                    {channelType.description}
                                                                </FieldDescription>
                                                            </FieldContent>
                                                            <RadioGroupItem
                                                                value={channelType.id}
                                                                id={`create-guild-channel-radiogroup-${channelType.id}`}
                                                                aria-invalid={fieldState.invalid}
                                                            />
                                                        </Field>
                                                    </FieldLabel>
                                                ))}
                                            </RadioGroup>
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                        </Field>
                                    )}
                                />
                                <Controller
                                    name="name"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor="create-guild-channel-field-name">
                                                Channel Name
                                            </FieldLabel>
                                            <Input
                                                id="create-guild-channel-field-name"
                                                placeholder="Enter a channel name"
                                                aria-invalid={fieldState.invalid}
                                                autoComplete="off"
                                                {...field}
                                            />
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                        </Field>
                                    )}
                                />
                                <Controller
                                    name="isPrivate"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <Item
                                                size="xs"
                                                variant="outline"
                                                className="border-2 has-[[aria-checked=true]]:bg-input/30"
                                            >
                                                <ItemMedia variant="icon">
                                                    <BrickWallShieldIcon />
                                                </ItemMedia>
                                                <ItemContent>
                                                    <ItemTitle>Private Channel</ItemTitle>
                                                    <ItemDescription>
                                                        Only members within selected roles will be able to view the
                                                        channel.
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
                            </FieldSet>
                        </FieldGroup>
                    ) : (
                        <FieldSet>
                            <FieldGroup>
                                <Controller
                                    control={form.control}
                                    name="roleIds"
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLegend>Private Category</FieldLegend>
                                            <FieldDescription>
                                                Select the roles you wish to assign to this channel.
                                            </FieldDescription>
                                            <div className="flex h-72 w-full grow-0 flex-col gap-1 overflow-y-auto pr-1">
                                                {customRoles.length ? (
                                                    customRoles.map((role) => (
                                                        <Field key={role.id}>
                                                            <Item variant="outline">
                                                                <ItemMedia>
                                                                    <ShieldCheckIcon className="size-5" />
                                                                </ItemMedia>
                                                                <ItemContent>
                                                                    <FieldLabel>
                                                                        <ItemTitle>{role.name}</ItemTitle>
                                                                    </FieldLabel>
                                                                </ItemContent>
                                                                <ItemActions>
                                                                    <Checkbox
                                                                        checked={field.value?.includes(role.id)}
                                                                        onCheckedChange={(checked) => {
                                                                            return checked
                                                                                ? field.onChange([
                                                                                      ...field.value,
                                                                                      role.id,
                                                                                  ])
                                                                                : field.onChange(
                                                                                      field.value?.filter(
                                                                                          (value) => value !== role.id,
                                                                                      ),
                                                                                  );
                                                                        }}
                                                                    />
                                                                </ItemActions>
                                                            </Item>
                                                        </Field>
                                                    ))
                                                ) : (
                                                    <Empty>
                                                        <EmptyHeader>
                                                            <EmptyMedia variant="icon">
                                                                <ShieldIcon />
                                                            </EmptyMedia>
                                                            <EmptyTitle>No Roles available</EmptyTitle>
                                                            <EmptyDescription>
                                                                You can create roles in guild settings, they will then
                                                                appear here.
                                                            </EmptyDescription>
                                                        </EmptyHeader>
                                                        <EmptyContent className="flex-row justify-center gap-2">
                                                            <Button
                                                                variant="outline"
                                                                onClick={() =>
                                                                    dialogUIStoreActions.openDialog(
                                                                        Dialogs.GuildSettings,
                                                                    )
                                                                }
                                                            >
                                                                <CogIcon />
                                                                <span>Guild Settings</span>
                                                            </Button>
                                                        </EmptyContent>
                                                    </Empty>
                                                )}
                                            </div>
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                        </Field>
                                    )}
                                />
                            </FieldGroup>
                        </FieldSet>
                    )}
                </form>
                <DialogFooter>
                    <Button variant="outline" className="cursor-pointer" onClick={handlePrevCancelClick}>
                        {prevButtonLabel}
                    </Button>
                    <Button form="create-guild-channel-form" className="cursor-pointer">
                        {nextButtonLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
