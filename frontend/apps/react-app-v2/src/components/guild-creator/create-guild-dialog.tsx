import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { useCloudinary } from "@/hooks/use-cloudinary";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { CameraIcon } from "lucide-react";
import { useCreateGuildMutation } from "@/lib/react-query/mutations/create-guild-mutation";
import { useCreateGuildDialogUIStore } from "@/lib/valtio/queries/create-guild-dialog-ui-store-queries";
import { closeCreateGuildDialog } from "@/lib/valtio/mutations/create-guild-dialog-ui-store-mutations";
import type { CreateGuildFormType } from "./create-guild-dialog-types";
import { createGuildFormSchema } from "./guild-creator-form-validation";

export function GuildCreator() {
    const isOpen = useCreateGuildDialogUIStore();
    return (
        <Dialog open={isOpen} onOpenChange={closeCreateGuildDialog} modal>
            <DialogContent className="w-96 gap-4">
                <GuildCreatorContent />
            </DialogContent>
        </Dialog>
    );
}

function GuildCreatorContent() {
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
        closeCreateGuildDialog();
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
        <>
            <DialogHeader className="items-center">
                <DialogTitle>Create a Server</DialogTitle>
                <DialogDescription className="text-center">
                    Give your new server a name and an icon, these can be changed anytime later.
                </DialogDescription>
            </DialogHeader>
            <div className="flex w-full justify-center">
                <Avatar className="h-28 w-28" onClick={onFileUploadClick}>
                    {attachments.length !== 0 && <AvatarImage src={attachments[0].preview} />}
                    <AvatarFallback className="flex flex-col space-y-1">
                        <CameraIcon size={26} />
                        <p className="text-xs font-medium">Upload</p>
                    </AvatarFallback>
                </Avatar>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Server Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Give your server a name" {...field} />
                                </FormControl>
                                <FormDescription>This is how people will find your server.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <UploadWrapper id="guild-creator" />
                    <DialogFooter>
                        <Button onClick={closeCreateGuildDialog} variant="secondary">
                            Cancel
                        </Button>
                        <Button type="submit">Create</Button>
                    </DialogFooter>
                </form>
            </Form>
        </>
    );
}
