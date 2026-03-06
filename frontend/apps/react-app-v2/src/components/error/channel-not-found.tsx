import { HashIcon } from "lucide-react";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../ui/empty";

export function ChannelNotFound() {
    return (
        <Empty>
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <HashIcon />
                </EmptyMedia>
                <EmptyTitle>Channel Not Found!</EmptyTitle>
                <EmptyDescription>
                    Looks like you've taken a wrong turn, this channel doesn't appear to exist.
                </EmptyDescription>
            </EmptyHeader>
        </Empty>
    );
}
