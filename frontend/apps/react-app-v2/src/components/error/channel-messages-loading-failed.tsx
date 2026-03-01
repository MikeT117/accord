import { CloudOffIcon } from "lucide-react";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "../ui/empty";

export function ChannelMessagesLoadingFailed() {
    return (
        <Empty>
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <CloudOffIcon />
                </EmptyMedia>
                <EmptyTitle>Unable To Load Messages</EmptyTitle>
                <EmptyDescription>
                    Unable to load channel messages, please ensure you're onlin and have access to this channel.
                </EmptyDescription>
            </EmptyHeader>
        </Empty>
    );
}
