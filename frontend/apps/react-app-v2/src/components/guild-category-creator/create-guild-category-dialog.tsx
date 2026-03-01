import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { useCreateGuildChannelMutation } from "@/lib/react-query/mutations/create-guild-channel-mutation";
import { GUILD_CHANNEL_TYPE } from "@/lib/zod-validation/channel-schema";
import { useState } from "react";
import { Switch } from "../ui/switch";
import { useGuildRolesArray } from "@/lib/valtio/queries/guild-store-queries";
import { Checkbox } from "../ui/checkbox";
import { BrickWallShieldIcon, CogIcon, ShieldCheckIcon, ShieldIcon } from "lucide-react";
import { useParams } from "@tanstack/react-router";
import type { ValueOf } from "@/lib/types/types";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "../ui/item";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "../ui/field";
import { openGuildSettings } from "@/lib/valtio/mutations/guild-settings-ui-store-mutations";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "../ui/empty";
import { closeCreateGuildCategoryDialog } from "@/lib/valtio/mutations/create-guild-category-dialog-ui-store-mutations";
import { useCreateGuildCategoryDialogUIStore } from "@/lib/valtio/queries/create-guild-category-dialog-ui-store-queries";
import { CreateGuildCategoryFormType } from "./types/create-guild-category-dialog-types";
import { createGuildCategoryFormSchema } from "./zod-validation/guild-category-creator-form-validation";

const FORM_STAGE = {
    CHANNEL_DETAILS: 0,
    CHANNEL_ROLES: 1,
} as const;

export function GuildCategoryCreator() {
    const { isOpen } = useCreateGuildCategoryDialogUIStore();
    return (
        <Dialog open={isOpen} onOpenChange={closeCreateGuildCategoryDialog} modal>
            <DialogContent>
                <GuildCategoryCreatorContent />
            </DialogContent>
        </Dialog>
    );
}

function GuildCategoryCreatorContent() {
    const { guildId } = useParams({ from: "/_auth/app/$guildId" });
    const [formStage, setFormStage] = useState<ValueOf<typeof FORM_STAGE>>(FORM_STAGE.CHANNEL_DETAILS);
    const { custom: customRoles } = useGuildRolesArray(guildId);
    const { mutate: createGuildChannel } = useCreateGuildChannelMutation();

    const form = useForm<CreateGuildCategoryFormType>({
        resolver: zodResolver(createGuildCategoryFormSchema),
        defaultValues: {
            name: "",
            isPrivate: false,
            roleIds: [],
        },
    });

    function handlePrevCancelClick() {
        if (formStage !== FORM_STAGE.CHANNEL_DETAILS) {
            setFormStage(FORM_STAGE.CHANNEL_DETAILS);
        } else {
            closeCreateGuildCategoryDialog();
        }
    }

    function onSubmit(values: CreateGuildCategoryFormType) {
        if (formStage === FORM_STAGE.CHANNEL_DETAILS && form.getValues("isPrivate").valueOf()) {
            setFormStage(FORM_STAGE.CHANNEL_ROLES);
        } else {
            createGuildChannel(
                {
                    ...values,
                    guildId,
                    channelType: GUILD_CHANNEL_TYPE.GUILD_CATEGORY_CHANNEL,
                },
                {
                    onSuccess: closeCreateGuildCategoryDialog,
                },
            );
        }
    }

    const nextButtonLabel = formStage === FORM_STAGE.CHANNEL_DETAILS && form.watch("isPrivate") ? "Next" : "Create";
    const prevButtonLabel = formStage === FORM_STAGE.CHANNEL_ROLES ? "Back" : "Cancel";

    return (
        <>
            <DialogHeader className="items-center">
                <DialogTitle>Create a Channel</DialogTitle>
            </DialogHeader>
            <form id="create-guild-channel-form" onSubmit={form.handleSubmit(onSubmit)}>
                {formStage === FORM_STAGE.CHANNEL_DETAILS ? (
                    <FieldGroup>
                        <FieldSet>
                            <Controller
                                name="name"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="create-guild-category-field-name">
                                            Category Name
                                        </FieldLabel>
                                        <Input
                                            id="create-guild-category-field-name"
                                            placeholder="Enter a category name"
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
                                                <ItemTitle>Private Category</ItemTitle>
                                                <ItemDescription>
                                                    Only members within selected roles will be able to view the
                                                    category.
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
                                            Select the roles you wish to assign to this category.
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
                                                                            ? field.onChange([...field.value, role.id])
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
                                                        <Button variant="outline" onClick={openGuildSettings}>
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
        </>
    );
}
