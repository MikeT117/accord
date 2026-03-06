import { CastleIcon } from "lucide-react";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "../ui/empty";
import { Button } from "../ui/button";
import { Dialogs, dialogUIStoreActions } from "@/lib/zustand/stores/dialog-ui-store";

export function GuildNotFound() {
    return (
        <Empty>
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <CastleIcon />
                </EmptyMedia>
                <EmptyTitle>Guild Not Found!</EmptyTitle>
                <EmptyDescription>
                    Looks like you've taken a wrong turn, this guild doesn't appear to exist.
                </EmptyDescription>
                <EmptyContent>
                    <Button variant="outline" onClick={() => dialogUIStoreActions.openDialog(Dialogs.CreateGuild)}>
                        <CastleIcon />
                        <span>Create Guild</span>
                    </Button>
                </EmptyContent>
            </EmptyHeader>
        </Empty>
    );
}
