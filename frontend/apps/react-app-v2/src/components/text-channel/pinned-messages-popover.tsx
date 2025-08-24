import { useInfiniteChannelMessagesQuery } from "@/lib/react-query/queries/channel-message-query";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { PinnedChannelMessage } from "./pinned-channel-message";
import { PinIcon } from "lucide-react";

type PinnedMessagesPopoverProps = {
    channelId: string;
    canUnpinMessage: boolean;
};

export function PinnedMessagesPopover({ canUnpinMessage, channelId }: PinnedMessagesPopoverProps) {
    return (
        <Popover>
            <PopoverTrigger className="text-muted-foreground hover:text-white data-[state=open]:text-white">
                <PinIcon className="size-5" />
            </PopoverTrigger>
            <PopoverContent
                className="flex max-h-[80svh] w-[420px] flex-col overflow-auto p-0"
                align="end"
                sideOffset={8}
            >
                <div className="border-b p-4">
                    <h1 className="font-semibold">Pinned Messages</h1>
                </div>
                <PinnedMessagesPopoverContent canUnpinMessage={canUnpinMessage} channelId={channelId} />
            </PopoverContent>
        </Popover>
    );
}

type PinnedMessagesPopoverContentProps = {
    channelId: string;
    canUnpinMessage: boolean;
};

function PinnedMessagesPopoverContent({ channelId, canUnpinMessage }: PinnedMessagesPopoverContentProps) {
    const { data, infiniteScrollRef } = useInfiniteChannelMessagesQuery({ channelId, pinned: true });

    if (!data.length) {
        return (
            <div className="flex min-h-[300px] grow items-center justify-center">
                <p className="font-medium text-muted-foreground">This channel doesn't have any pinned messages.</p>
            </div>
        );
    }

    return (
        <div className="mt-auto flex flex-col gap-2 p-2">
            {data.map((msg, i) => (
                <PinnedChannelMessage
                    key={msg.id}
                    message={msg}
                    canUnpinMessage={canUnpinMessage}
                    ref={(e) => infiniteScrollRef(i, e)}
                />
            ))}
        </div>
    );
}
