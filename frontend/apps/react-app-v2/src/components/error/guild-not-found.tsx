import { CastleIcon } from "lucide-react";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "../ui/empty";
import { Button } from "../ui/button";
import { openCreateGuildDialog } from "@/lib/valtio/mutations/create-guild-dialog-ui-store-mutations";

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
                        <Button variant="outline" onClick={openCreateGuildDialog}>
                            <CastleIcon />
                            <span>Create Guild</span>
                        </Button>
                    </EmptyContent>
                </EmptyHeader>
            </Empty>
        </div>
    );
}
