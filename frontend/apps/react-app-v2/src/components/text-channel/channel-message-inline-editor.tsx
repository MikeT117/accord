import type { ChannelMessageType } from "@/lib/types/types";
import { ChannelMessageEmojiPicker } from "./channel-message-creator-emoji-picker";
import { useUpdateChannelMessageMutation } from "@/lib/react-query/mutations/update-channel-message-mutation";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import { ChannelMessageCreatorInput } from "./channel-message-creator-input";
import { useState } from "react";
import { InputGroup, InputGroupAddon } from "../ui/input-group";
import { Button } from "../ui/button";

type ChannelMessageInlineEditorProps = {
    message: ChannelMessageType;
    onClose: () => void;
};

export function ChannelMessageInlineEditor({ message, onClose }: ChannelMessageInlineEditorProps) {
    const [content, setContent] = useState(message.content);
    const { mutate: updateMessage } = useUpdateChannelMessageMutation({ onSuccess: onClose });

    useKeyboardShortcut({ handler: onClose, key: "Escape" });

    function submitMessage() {
        if (content.trim() === message.content.trim()) {
            onClose();
            return;
        }
        updateMessage({ ...message, content });
    }

    function handleChange(value: string) {
        setContent(value);
    }

    function handleEmojiSelect(emoji: string) {
        setContent((s) => s + emoji);
    }

    return (
        <div className="flex w-full flex-col space-y-1">
            <InputGroup>
                <ChannelMessageCreatorInput
                    onChange={handleChange}
                    value={content}
                    onSubmit={submitMessage}
                    isDisabled={false}
                />
                <InputGroupAddon align="inline-end">
                    <ChannelMessageEmojiPicker onEmojiSelect={handleEmojiSelect} isDisabled={false} />
                </InputGroupAddon>
            </InputGroup>
            <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">escape to</span>
                <Button onClick={onClose} aria-label="Cancel Edit" variant="link" className="m-0 p-0 text-xs">
                    cancel
                </Button>
                <span className="text-xs text-muted-foreground">|</span>
                <span className="text-xs text-muted-foreground">enter to</span>
                <Button onClick={submitMessage} aria-label="Save Edits" variant="link" className="m-0 p-0 text-xs">
                    save
                </Button>
            </div>
        </div>
    );
}
