import type { ChannelMessageType } from "@/lib/types/types";
import { ChannelMessageEmojiPicker } from "./channel-message-creator-emoji-picker";
import { useUpdateChannelMessageMutation } from "@/lib/react-query/mutations/update-channel-message-mutation";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import { ChannelMessageCreatorInput } from "./channel-message-creator-input";
import { useState } from "react";

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
            <div className="flex grow flex-col space-x-3 overflow-hidden rounded-md border border-input bg-transparent px-3 shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 dark:bg-input/15">
                <div className="flex items-center space-x-3">
                    <ChannelMessageCreatorInput
                        onChange={handleChange}
                        onSubmit={submitMessage}
                        value={content}
                        isDisabled={false}
                    />
                    <ChannelMessageEmojiPicker onEmojiSelect={handleEmojiSelect} isDisabled={false} />
                </div>
            </div>
            <div className="flex w-full items-center space-x-1 text-muted-foreground">
                <span className="text-gray-11 text-xs font-light">escape to</span>
                <button
                    className="text-indigo-11 text-xs font-medium hover:underline"
                    onClick={onClose}
                    aria-label="Cancel Edit"
                >
                    cancel
                </button>
                <span className="text-gray-11 text-xs">|</span>
                <span className="text-gray-11 text-xs font-light">enter to</span>
                <button
                    className="text-indigo-11 text-xs font-medium hover:underline"
                    onClick={submitMessage}
                    aria-label="Save Edits"
                >
                    save
                </button>
            </div>
        </div>
    );
}
