import { useEffect, useRef } from "react";
import { InputGroupTextarea } from "../ui/input-group";

type ChannelMessageCreatorInputProps = {
    value: string;
    placeholder?: string;
    isDisabled?: boolean;
    onChange: (value: string) => void;
    onSubmit: () => void;
};

export function ChannelMessageCreatorInput({
    value,
    placeholder,
    isDisabled,
    onChange,
    onSubmit,
}: ChannelMessageCreatorInputProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const maxHeight = 150;

    useEffect(() => {
        if (!textareaRef.current) {
            return;
        }

        textareaRef.current.style.height = "0px";
        const scrollHeight = textareaRef.current.scrollHeight;
        textareaRef.current.style.height = Math.min(scrollHeight, maxHeight) + "px";
        textareaRef.current.style.overflowY = scrollHeight > maxHeight ? "auto" : "hidden";
    }, [value]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && (e.ctrlKey || !e.shiftKey)) {
            e.preventDefault();
            onSubmit();
        }
    };

    return (
        <InputGroupTextarea
            className="min-h-[36px]"
            ref={textareaRef}
            placeholder={placeholder}
            aria-placeholder={placeholder}
            value={value}
            disabled={isDisabled}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
        />
    );
}
