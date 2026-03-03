import { HashIcon } from "lucide-react";
import type { ReactNode } from "react";

type TextChannelProps = {
    name: string;
    pinnedMessages: ReactNode;
    messages: ReactNode;
    messageCreator: ReactNode;
};

export function TextChannel({ messageCreator, messages, name, pinnedMessages }: TextChannelProps) {
    return (
        <div className="grid grid-cols-1 grid-rows-[50px_1fr_min-content] overflow-hidden">
            <div className="flex items-center justify-between border-b px-4">
                <div className="flex items-center space-x-1">
                    <HashIcon className="size-5 text-muted-foreground" />
                    <h1 className="font-medium">{name}</h1>
                </div>
                {pinnedMessages}
            </div>
            <div className="mt-auto flex h-full flex-col-reverse overflow-auto py-4"> {messages}</div>
            {messageCreator}
        </div>
    );
}
