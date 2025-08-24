import { PlusCircleIcon } from "lucide-react";
import { useCreateChannelMessageMutation } from "@/lib/react-query/mutations/create-channel-message-mutation";
import { useCloudinary } from "@/hooks/use-cloudinary";
import { Button } from "../ui/button";
import { ChannelMessageCreatorAttachmentPreview } from "./channel-message-creator-attachment-preview";
import { ChannelMessageEmojiPicker } from "./channel-message-creator-emoji-picker";
import { useMessageDraft } from "@/lib/valtio/queries/message-draft-store-queries";
import {
    appendMessageDraft,
    resetMessageDraft,
    setMessageDraft,
} from "@/lib/valtio/mutations/message-draft-store-mutations";
import { ChannelMessageCreatorInput } from "./channel-message-creator-input";

type ChannelMessageCreatorProps = {
    channelId: string;
    channelName?: string;
    canCreateMessage: boolean;
};

export function ChannelMessageCreator({ channelId, channelName, canCreateMessage }: ChannelMessageCreatorProps) {
    const content = useMessageDraft(channelId);
    const { mutate: createMessage } = useCreateChannelMessageMutation({ onSuccess: resetMessageContent });
    const { UploadWrapper, onFileUploadClick, attachments, deleteAttachment, clearAttachments } = useCloudinary();

    function submitMessage() {
        if (!canCreateMessage) {
            return;
        }

        createMessage({ channelId, attachmentIds: attachments.map((a) => a.id), content });
    }

    function resetMessageContent() {
        clearAttachments();
        resetMessageDraft(channelId);
    }

    function handleChange(value: string) {
        setMessageDraft(channelId, value);
    }

    function handleEmojiSelect(emoji: string) {
        appendMessageDraft(channelId, emoji);
    }

    const placeholder = canCreateMessage
        ? `Message ${channelName}`
        : "You don't have permission to message in this channel";

    return (
        <div className="flex w-full px-4 pb-4">
            <div className="flex grow flex-col space-x-3 overflow-hidden rounded-md border border-input bg-transparent px-3 py-1.5 shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 dark:bg-input/15">
                {attachments.length !== 0 && (
                    <div className="flex gap-4 overflow-x-auto overflow-y-hidden py-3">
                        {attachments.map((a) => (
                            <ChannelMessageCreatorAttachmentPreview
                                key={a.id}
                                preview={a.preview}
                                name={a.name}
                                onDelete={() => deleteAttachment(a.id)}
                            />
                        ))}
                    </div>
                )}
                <div className="flex items-center space-x-3">
                    <Button
                        aria-label="Attach File"
                        size="icon"
                        variant="link"
                        className="h-min w-min cursor-pointer text-muted-foreground hover:cursor-pointer hover:text-primary"
                        onClick={onFileUploadClick}
                        disabled={!canCreateMessage}
                    >
                        <PlusCircleIcon className="size-5" />
                    </Button>
                    <ChannelMessageCreatorInput
                        onChange={handleChange}
                        value={content}
                        onSubmit={submitMessage}
                        placeholder={placeholder}
                        isDisabled={!canCreateMessage}
                    />
                    <ChannelMessageEmojiPicker onEmojiSelect={handleEmojiSelect} isDisabled={!canCreateMessage} />
                </div>
            </div>
            <UploadWrapper id="message-creator" disabled={!canCreateMessage} />
        </div>
    );
}
