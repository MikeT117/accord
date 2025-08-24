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
        <div className="flex w-full flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b p-4">
                <div className="flex items-center space-x-0.5">
                    <HashIcon className="size-5 text-muted-foreground" />
                    <h1 className="font-medium">{name}</h1>
                </div>
                {pinnedMessages}
            </div>
            <div className="mt-auto flex flex-col-reverse overflow-auto">{messages}</div>
            {messageCreator}
        </div>
    );
}
