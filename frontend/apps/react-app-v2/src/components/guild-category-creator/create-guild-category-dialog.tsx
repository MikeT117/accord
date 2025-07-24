import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import type { CreateGuildCategoryFormType } from "./create-guild-category-dialog-types";
import { createGuildCategoryFormSchema } from "./guild-category-creator-form-validation";
import { useCreateGuildChannelMutation } from "@/lib/react-query/mutations/create-guild-channel-mutation";
import { GUILD_CHANNEL_TYPE } from "@/lib/zod-validation/channel-schema";
import { useState } from "react";
import { Switch } from "../ui/switch";
import { useCustomGuildRoles } from "@/lib/valtio/queries/guild-store-queries";
import { Checkbox } from "../ui/checkbox";
import { ShieldCheckIcon } from "lucide-react";
import { useParams } from "@tanstack/react-router";
import type { ValueOf } from "@/lib/types/types";
import { useCreateGuildCategoryDialogUIStore } from "@/lib/valtio/queries/create-guild-category-dialog-ui-store-queries";
import { closeCreateGuildCategoryDialog } from "@/lib/valtio/mutations/create-guild-category-dialog-ui-store-mutations";

const FORM_STAGE = {
    CHANNEL_DETAILS: 0,
    CHANNEL_ROLES: 1,
} as const;

export function GuildCategoryCreator() {
    const { isOpen } = useCreateGuildCategoryDialogUIStore();
    return (
        <Dialog open={isOpen} onOpenChange={closeCreateGuildCategoryDialog} modal>
            <DialogContent className="w-[440px] gap-4">
                <GuildCategoryCreatorContent />
            </DialogContent>
        </Dialog>
    );
}

function GuildCategoryCreatorContent() {
    const { guildId } = useParams({ from: "/_auth/app/$guildId" });
    const [formStage, setFormStage] = useState<ValueOf<typeof FORM_STAGE>>(FORM_STAGE.CHANNEL_DETAILS);
    const guildRoles = useCustomGuildRoles(guildId);
    const { mutate: createGuildChannel } = useCreateGuildChannelMutation({ onSuccess: handleSuccess });

    const form = useForm<CreateGuildCategoryFormType>({
        resolver: zodResolver(createGuildCategoryFormSchema),
        defaultValues: {
            name: "",
            isPrivate: false,
            roleIds: [],
        },
    });

    function handleNextSubmitClick() {
        if (formStage === 0 && form.watch("isPrivate")) {
            setFormStage(FORM_STAGE.CHANNEL_ROLES);
        } else {
            form.handleSubmit(onSubmit)();
        }
    }

    function handlePrevCancelClick() {
        if (formStage !== 0) {
            setFormStage(FORM_STAGE.CHANNEL_DETAILS);
        } else {
            closeCreateGuildCategoryDialog();
        }
    }

    function handleSuccess() {
        closeCreateGuildCategoryDialog();
    }

    function onSubmit(values: CreateGuildCategoryFormType) {
        createGuildChannel({
            ...values,
            guildId,
            channelType: GUILD_CHANNEL_TYPE.GUILD_CATEGORY_CHANNEL,
        });
    }

    const nextButtonLabel = formStage === FORM_STAGE.CHANNEL_DETAILS && form.watch("isPrivate") ? "Next" : "Create";
    const prevButtonLabel = formStage === FORM_STAGE.CHANNEL_ROLES ? "Prev" : "Cancel";

    return (
        <>
            <DialogHeader className="items-center">
                <DialogTitle>Create a Category</DialogTitle>
            </DialogHeader>
            <Form {...form}>
                <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                    {formStage === FORM_STAGE.CHANNEL_DETAILS ? (
                        <>
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Give your channel a name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="isPrivate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 has-[[aria-checked=true]]:bg-muted">
                                        <div className="space-y-0.5">
                                            <FormLabel>Private Category</FormLabel>
                                            <FormDescription className="text-xs">
                                                Only selected members will be able to view the category.
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </>
                    ) : (
                        <FormField
                            control={form.control}
                            name="roleIds"
                            render={() => (
                                <FormItem>
                                    <FormLabel className="text-base">Roles</FormLabel>
                                    <FormDescription>
                                        Select the roles you wish to assign to this category.
                                    </FormDescription>
                                    <div className="flex flex-col grow-0 h-72 overflow-y-auto w-full gap-1 pr-1">
                                        {guildRoles.map((role) => (
                                            <FormField
                                                key={role.id}
                                                control={form.control}
                                                name="roleIds"
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center gap-2">
                                                        <FormLabel className="hover:bg-accent/50 cursor-pointer flex gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:bg-muted w-full">
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={field.value?.includes(role.id)}
                                                                    onCheckedChange={(checked) => {
                                                                        return checked
                                                                            ? field.onChange([...field.value, role.id])
                                                                            : field.onChange(
                                                                                  field.value?.filter(
                                                                                      (value) => value !== role.id
                                                                                  )
                                                                              );
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <div className="flex justify-center items-center space-x-2">
                                                                <ShieldCheckIcon size={20} />
                                                                <p className="text-sm leading-none font-medium">
                                                                    {role.name}
                                                                </p>
                                                            </div>
                                                        </FormLabel>
                                                    </FormItem>
                                                )}
                                            />
                                        ))}
                                    </div>
                                </FormItem>
                            )}
                        />
                    )}
                </form>
            </Form>
            <DialogFooter>
                <Button variant="secondary" className="cursor-pointer" onClick={handlePrevCancelClick}>
                    {prevButtonLabel}
                </Button>
                <Button className="cursor-pointer" onClick={handleNextSubmitClick}>
                    {nextButtonLabel}
                </Button>
            </DialogFooter>
        </>
    );
}
