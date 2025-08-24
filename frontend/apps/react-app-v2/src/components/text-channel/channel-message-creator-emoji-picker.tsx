import { EmojiPicker, EmojiPickerSearch, EmojiPickerContent, EmojiPickerFooter } from "@/components/ui/emoji-picker";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { SmileIcon } from "lucide-react";

type ChannelMessageEmojiPickerProps = {
    isDisabled: boolean;
    onEmojiSelect: (emoji: string) => void;
};

export function ChannelMessageEmojiPicker({ onEmojiSelect, isDisabled }: ChannelMessageEmojiPickerProps) {
    return (
        <Popover modal>
            <PopoverTrigger
                disabled={isDisabled}
                className="cursor-pointer text-muted-foreground hover:text-white data-[state=open]:text-white"
            >
                <SmileIcon className="size-5" />
            </PopoverTrigger>
            <PopoverContent className="w-fit p-0" align="end" side="top" alignOffset={-12} sideOffset={24}>
                <EmojiPicker className="h-[360px]" onEmojiSelect={({ emoji }) => onEmojiSelect(emoji)}>
                    <EmojiPickerSearch />
                    <EmojiPickerContent />
                    <EmojiPickerFooter />
                </EmojiPicker>
            </PopoverContent>
        </Popover>
    );
}
