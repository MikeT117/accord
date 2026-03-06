import { CloudOffIcon } from "lucide-react";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "../ui/empty";

export function UnknownError() {
    return (
        <Empty>
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <CloudOffIcon />
                </EmptyMedia>
                <EmptyTitle>Unknown Error</EmptyTitle>
                <EmptyDescription>An unknown error occurred, please refresh the app.</EmptyDescription>
            </EmptyHeader>
        </Empty>
    );
}
