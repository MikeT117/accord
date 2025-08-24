import { useEffect, useRef } from "react";

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
        <div className="flex flex-1 items-center">
            <textarea
                ref={textareaRef}
                className="w-full resize-none overflow-hidden py-2 text-sm leading-relaxed whitespace-pre-wrap text-foreground transition-[color] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                placeholder={placeholder}
                aria-placeholder={placeholder}
                value={value}
                disabled={isDisabled}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
            />
        </div>
    );
}
