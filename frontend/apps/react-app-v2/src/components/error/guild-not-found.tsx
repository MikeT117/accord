import { CastleIcon } from "lucide-react";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "../ui/empty";
import { Button } from "../ui/button";
import { Dialogs, dialogUIStoreActions } from "@/lib/zustand/stores/dialog-ui-store";

export function GuildNotFound() {
    return (
        <div className="col-span-2 flex items-center justify-center">
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <CastleIcon />
                    </EmptyMedia>
                    <EmptyTitle>404 - Guild Not Found</EmptyTitle>
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
        </div>
    );
}
