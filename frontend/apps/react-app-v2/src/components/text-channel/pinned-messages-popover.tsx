import { useInfiniteChannelMessagesQuery } from "@/lib/react-query/queries/channel-message-query";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { PinnedChannelMessage } from "./pinned-channel-message";
import { PinIcon } from "lucide-react";
import { ButtonWithTooltip } from "../button-with-tooltip";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../ui/empty";

type PinnedMessagesPopoverProps = {
    channelId: string;
    canUnpinMessage: boolean;
};

export function PinnedMessagesPopover({ canUnpinMessage, channelId }: PinnedMessagesPopoverProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <ButtonWithTooltip variant="outline" tooltipText="Pinned Messages" size="icon">
                    <PinIcon className="rotate-45" />
                </ButtonWithTooltip>
            </PopoverTrigger>
            <PopoverContent
                className="max-h-[80svh] min-h-80 w-sm gap-0 overflow-auto bg-card p-0"
                align="end"
                sideOffset={8}
            >
                <div className="flex items-center gap-3 border-b p-4">
                    <PinIcon className="size-5 rotate-45" />
                    <h1 className="text-lg font-medium">Pinned Messages</h1>
                </div>
                <div className="flex flex-col gap-3 p-3">
                    <PinnedMessagesPopoverContent canUnpinMessage={canUnpinMessage} channelId={channelId} />
                </div>
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
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <PinIcon className="rotate-45" />
                    </EmptyMedia>
                    <EmptyTitle>No Pins yet</EmptyTitle>
                    <EmptyDescription>
                        You can pin messages by clicking the pin icon when hovering over a message.
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        );
    }

    return data.map((msg, i) => (
        <PinnedChannelMessage
            key={msg.id}
            message={msg}
            canUnpinMessage={canUnpinMessage}
            ref={(e) => infiniteScrollRef(i, e)}
        />
    ));
}
