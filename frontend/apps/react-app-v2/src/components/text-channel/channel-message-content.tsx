import { emojiRegExp } from "@/lib/constants";
import { useMemo } from "react";

type ChannelMessageContentProps = {
    content: string;
};

type ParsedContent = { str: string; emoji?: never } | { emoji: string; str?: never };

function parseContent(content: string): ParsedContent[] {
    const matches = content.matchAll(emojiRegExp);

    let idx = 0;
    const contentArr = [];
    for (const match of matches) {
        if (idx !== match.index) {
            contentArr.push({ str: content.slice(idx, match.index) });
        }

        contentArr.push({ emoji: match[0] });
        idx = match.index + match[0].length;
    }

    if (idx !== content.length) {
        contentArr.push({ str: content.slice(idx, content.length) });
    }

    return contentArr;
}

export function ChannelMessageContent({ content }: ChannelMessageContentProps) {
    const parsedContent = useMemo(() => parseContent(content.trim()), [content]);

    if (parsedContent.length === 1 && parsedContent[0].emoji) {
        return <span className="flex w-[40px] justify-center text-4xl leading-none">{parsedContent[0].emoji}</span>;
    }

    return (
        <div className="flex items-center">
            {parsedContent.map((value, idx) => (
                <span
                    key={idx}
                    className={
                        value.emoji
                            ? "flex w-[20px] justify-center text-lg leading-none"
                            : "text-sm leading-relaxed whitespace-pre-wrap text-foreground"
                    }
                >
                    {value.emoji ?? value.str}
                </span>
            ))}
        </div>
    );
}
