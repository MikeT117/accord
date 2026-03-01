import { MessageCircleIcon, MoreHorizontalIcon, UserRoundXIcon } from "lucide-react";
import { RELATIONSHIP_STATUS } from "@/lib/zod-validation/relationship-schema";
import { AvatarWithFallback } from "../avatar-with-fallback";
import { ButtonWithTooltip } from "../button-with-tooltip";
import { getPrivateDirectChannelIdByUserId } from "@/lib/valtio/queries/private-channel-store-queries";
import { useNavigate } from "@tanstack/react-router";
import { useCreatePrivateChannelMutation } from "@/lib/react-query/mutations/create-private-channel-mutation";
import { useFilteredRelationships } from "./hooks/use-filtered-relationships";
import { useDeleteRelationshipMutation } from "@/lib/react-query/mutations/delete-relationship-mutation";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "../ui/item";
import { Button } from "../ui/button";
import { openCreateRelationshipRequestDialog } from "@/lib/valtio/mutations/create-relationship-request-dialog-ui-store-mutations";
import { FilterInput } from "../filter-input";

export function UserDashboardFriendsList() {
    const { filteredRelationships, filter, setFilter } = useFilteredRelationships(RELATIONSHIP_STATUS.FRIEND);
    const { mutate: createPrivateChannel } = useCreatePrivateChannelMutation();
    const { mutate: deleteRelationship } = useDeleteRelationshipMutation();
    const navigate = useNavigate();

    function handleDeleteRelationship(relationshipId: string) {
        deleteRelationship({ id: relationshipId });
    }

    function navigateToChannel(channelId: string) {
        navigate({ to: "/app/dashboard/$channelId", params: { channelId } });
    }

    function handleChatClick(userId: string) {
        const existingChannelID = getPrivateDirectChannelIdByUserId(userId);
        if (!existingChannelID) {
            createPrivateChannel(
                { userIds: [userId] },
                {
                    onSuccess(data) {
                        navigateToChannel(data.id);
                    },
                },
            );
            return;
        }

        navigateToChannel(existingChannelID);
    }

    return (
        <div className="space-y-3 p-3">
            <div className="flex items-center space-x-3">
                <FilterInput filterValue={filter} onChange={setFilter} resultsCount={filteredRelationships.length} />
                <Button onClick={openCreateRelationshipRequestDialog}>Add Friend</Button>
            </div>
            <div className="flex flex-col overflow-auto">
                {filteredRelationships.map((r) => (
                    <Item variant="outline" key={r.id}>
                        <ItemMedia>
                            <AvatarWithFallback src={r.user.avatar} fallback={r.user.displayName} size="lg" />
                        </ItemMedia>
                        <ItemContent>
                            <ItemTitle>{r.user.displayName}</ItemTitle>
                            <ItemDescription>{r.user.username}</ItemDescription>
                        </ItemContent>
                        <ItemActions>
                            <ButtonWithTooltip
                                size="icon"
                                tooltipText="Open Direct Channel"
                                variant="outline"
                                onClick={() => handleChatClick(r.user.id)}
                            >
                                <MessageCircleIcon />
                            </ButtonWithTooltip>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <ButtonWithTooltip
                                        aria-label="More Options"
                                        variant="outline"
                                        size="icon"
                                        tooltipText="More Options"
                                    >
                                        <MoreHorizontalIcon />
                                    </ButtonWithTooltip>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-48" align="end" sideOffset={8} side="bottom">
                                    <DropdownMenuItem
                                        variant="destructive"
                                        className="justify-between"
                                        onClick={() => handleDeleteRelationship(r.id)}
                                    >
                                        Remove Friend
                                        <UserRoundXIcon />
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </ItemActions>
                    </Item>
                ))}
            </div>
        </div>
    );
}
