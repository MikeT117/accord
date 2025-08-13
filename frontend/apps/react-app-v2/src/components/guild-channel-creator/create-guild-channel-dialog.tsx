import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import type { CreateGuildChannelFormType } from "./create-guild-channel-dialog-types";
import { createGuildChannelFormSchema } from "./guild-channel-creator-form-validation";
import { closeCreateGuildChannelDialog } from "@/lib/valtio/mutations/create-guild-channel-dialog-ui-store-mutations";
import { useCreateGuildChannelDialogUIStore } from "@/lib/valtio/queries/create-guild-channel-dialog-ui-store-queries";
import { useCreateGuildChannelMutation } from "@/lib/react-query/mutations/create-guild-channel-mutation";
import { GUILD_CHANNEL_TYPE } from "@/lib/zod-validation/channel-schema";
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Switch } from "../ui/switch";
import { useGuildRolesArray } from "@/lib/valtio/queries/guild-store-queries";
import { Checkbox } from "../ui/checkbox";
import { ShieldCheckIcon } from "lucide-react";
import { useParams } from "@tanstack/react-router";
import type { ValueOf } from "@/lib/types/types";

const FORM_STAGE = {
    CHANNEL_DETAILS: 0,
    CHANNEL_ROLES: 1,
} as const;

export function GuildChannelCreator() {
    const { isOpen } = useCreateGuildChannelDialogUIStore();
    return (
        <Dialog open={isOpen} onOpenChange={closeCreateGuildChannelDialog} modal>
            <DialogContent className="w-[440px] gap-4">
                <GuildChannelCreatorContent />
            </DialogContent>
        </Dialog>
    );
}

function GuildChannelCreatorContent() {
    const { guildId } = useParams({ from: "/_auth/app/$guildId" });
    const [formStage, setFormStage] = useState<ValueOf<typeof FORM_STAGE>>(FORM_STAGE.CHANNEL_DETAILS);
    const { custom: customRoles } = useGuildRolesArray(guildId);
    const { mutate: createGuildChannel } = useCreateGuildChannelMutation({ onSuccess: handleSuccess });

    const form = useForm<CreateGuildChannelFormType>({
        resolver: zodResolver(createGuildChannelFormSchema),
        defaultValues: {
            name: "",
            isPrivate: false,
            roleIds: [],
            channelType: "GUILD_TEXT_CHANNEL",
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
            closeCreateGuildChannelDialog();
        }
    }

    function handleSuccess() {
        closeCreateGuildChannelDialog();
    }

    function onSubmit(values: CreateGuildChannelFormType) {
        createGuildChannel({
            ...values,
            guildId,
            channelType: GUILD_CHANNEL_TYPE[values.channelType],
        });
    }

    const nextButtonLabel = formStage === FORM_STAGE.CHANNEL_DETAILS && form.watch("isPrivate") ? "Next" : "Create";
    const prevButtonLabel = formStage === FORM_STAGE.CHANNEL_ROLES ? "Prev" : "Cancel";

    return (
        <>
            <DialogHeader className="items-center">
                <DialogTitle>Create a Channel</DialogTitle>
            </DialogHeader>
            <Form {...form}>
                <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                    {formStage === FORM_STAGE.CHANNEL_DETAILS ? (
                        <>
                            <FormField
                                control={form.control}
                                name="channelType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Channel Type</FormLabel>
                                        <FormControl className="gap-1">
                                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormItem>
                                                    <FormLabel className="flex items-center border rounded-md p-3 space-x-2 cursor-pointer has-[[aria-checked=true]]:bg-muted">
                                                        <FormControl>
                                                            <RadioGroupItem value="GUILD_TEXT_CHANNEL" />
                                                        </FormControl>
                                                        <div className="space-y-0.5">
                                                            <p>Text Channel</p>
                                                            <FormDescription className="text-xs">
                                                                Send messages, images, emoji etc.
                                                            </FormDescription>
                                                        </div>
                                                    </FormLabel>
                                                </FormItem>
                                                <FormItem>
                                                    <FormLabel className="flex items-center border rounded-md p-3 space-x-2 cursor-pointer has-[[aria-checked=true]]:bg-muted">
                                                        <FormControl>
                                                            <RadioGroupItem value="GUILD_VOICE_CHANNEL" />
                                                        </FormControl>
                                                        <div className="space-y-0.5">
                                                            <p>Voice Channel</p>
                                                            <FormDescription className="text-xs">
                                                                Voice chat with friends.
                                                            </FormDescription>
                                                        </div>
                                                    </FormLabel>
                                                </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Channel Name</FormLabel>
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
                                            <FormLabel>Private Channel</FormLabel>
                                            <FormDescription className="text-xs">
                                                Only members within selected roles will be able to view the channel.
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
                                        Select the roles you wish to assign to this channel.
                                    </FormDescription>
                                    <div className="flex flex-col grow-0 h-72 overflow-y-auto w-full gap-1 pr-1">
                                        {customRoles.map((role) => (
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
