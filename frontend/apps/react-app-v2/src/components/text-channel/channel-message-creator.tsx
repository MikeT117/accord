import { PlusCircleIcon, Trash2Icon } from "lucide-react";
import { useCreateChannelMessageMutation } from "@/lib/react-query/mutations/create-channel-message-mutation";
import { UploadWrapper, useCloudinary } from "@/hooks/use-cloudinary";
import { ChannelMessageEmojiPicker } from "./channel-message-creator-emoji-picker";
import { ChannelMessageCreatorInput } from "./channel-message-creator-input";
import { InputGroup, InputGroupAddon } from "../ui/input-group";
import { ButtonWithTooltip } from "../button-with-tooltip";
import { Item, ItemContent, ItemDescription, ItemGroup, ItemHeader } from "../ui/item";
import { Image } from "@/components/image";
import { useMessageDraft, messageDraftStoreActions } from "@/lib/zustand/stores/message-draft-store";

type ChannelMessageCreatorProps = {
    channelId: string;
    channelName?: string;
    canCreateMessage: boolean;
};

export function ChannelMessageCreator({ channelId, channelName, canCreateMessage }: ChannelMessageCreatorProps) {
    const content = useMessageDraft(channelId);
    const { mutate: createMessage } = useCreateChannelMessageMutation({ onSuccess: resetMessageContent });
    const { onClick, setRef, attachments, deleteAttachment, clearAttachments } = useCloudinary();

    function submitMessage() {
        if (!canCreateMessage) {
            return;
        }

        createMessage({ channelId, attachmentIds: attachments.map((a) => a.id), content });
    }

    function resetMessageContent() {
        clearAttachments();
        messageDraftStoreActions.resetMessageDraft(channelId);
    }

    function handleChange(value: string) {
        messageDraftStoreActions.setMessageDraft(channelId, value);
    }

    function handleEmojiSelect(emoji: string) {
        messageDraftStoreActions.appendMessageDraft(channelId, emoji);
    }

    const placeholder = canCreateMessage
        ? `Message ${channelName}`
        : "You don't have permission to message in this channel";

    return (
        <div className="flex w-full flex-col px-4 pb-4">
            {attachments.length !== 0 && (
                <ItemGroup className="grid max-h-72 grid-rows-1 gap-4">
                    <div className="flex gap-4 overflow-x-auto overflow-y-hidden py-3">
                        {attachments.map((a) => (
                            <Item key={a.id} className="max-w-52" variant="outline">
                                <ItemHeader className="relative">
                                    <Image
                                        className="aspect-square max-h-52 w-full object-contain"
                                        preview={a.preview}
                                        alt={a.name}
                                    />
                                    <ButtonWithTooltip
                                        className="absolute -top-2 -right-2"
                                        variant="destructive"
                                        tooltipText="Delete Attachment"
                                        onClick={() => deleteAttachment(a.id)}
                                    >
                                        <Trash2Icon />
                                    </ButtonWithTooltip>
                                </ItemHeader>
                                <ItemContent className="overflow-hidden">
                                    <ItemDescription className="truncate text-xs">{a.name}</ItemDescription>
                                </ItemContent>
                            </Item>
                        ))}
                    </div>
                </ItemGroup>
            )}
            <InputGroup>
                <InputGroupAddon align="inline-start">
                    <ButtonWithTooltip
                        tooltipText="Attach Files"
                        aria-label="Attach Files"
                        size="icon"
                        onClick={onClick}
                        disabled={!canCreateMessage}
                        variant="ghost"
                    >
                        <PlusCircleIcon />
                    </ButtonWithTooltip>
                </InputGroupAddon>
                <ChannelMessageCreatorInput
                    onChange={handleChange}
                    value={content}
                    onSubmit={submitMessage}
                    placeholder={placeholder}
                    isDisabled={!canCreateMessage}
                />
                <InputGroupAddon align="inline-end">
                    <ChannelMessageEmojiPicker onEmojiSelect={handleEmojiSelect} isDisabled={!canCreateMessage} />
                </InputGroupAddon>
            </InputGroup>
            <UploadWrapper id="message-creator" ref={setRef} disabled={!canCreateMessage} />
        </div>
    );
}
