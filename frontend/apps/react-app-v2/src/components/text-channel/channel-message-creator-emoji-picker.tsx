import { EmojiPicker, EmojiPickerSearch, EmojiPickerContent, EmojiPickerFooter } from "@/components/ui/emoji-picker";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ButtonWithTooltip } from "../button-with-tooltip";
import { SmileIcon } from "lucide-react";

type ChannelMessageEmojiPickerProps = {
    isDisabled: boolean;
    onEmojiSelect: (emoji: string) => void;
};

export function ChannelMessageEmojiPicker({ onEmojiSelect, isDisabled }: ChannelMessageEmojiPickerProps) {
    return (
        <Popover modal>
            <PopoverTrigger disabled={isDisabled} asChild>
                <ButtonWithTooltip
                    tooltipText="Open Emoji Picker"
                    aria-label="Open Emoji Picker"
                    size="icon"
                    disabled={isDisabled}
                    variant="ghost"
                >
                    <SmileIcon />
                </ButtonWithTooltip>
            </PopoverTrigger>
            <PopoverContent className="w-fit p-0" align="end" side="top" alignOffset={-3} sideOffset={24}>
                <EmojiPicker className="h-[360px]" onEmojiSelect={({ emoji }) => onEmojiSelect(emoji)}>
                    <EmojiPickerSearch />
                    <EmojiPickerContent />
                    <EmojiPickerFooter />
                </EmojiPicker>
            </PopoverContent>
        </Popover>
    );
}
