import { BanIcon, HeartHandshakeIcon } from "lucide-react";
import { RELATIONSHIP_STATUS } from "@/lib/zod-validation/relationship-schema";
import { AvatarWithFallback } from "../avatar-with-fallback";
import { useFilteredRelationships } from "./hooks/use-filtered-relationships";
import { useDeleteRelationshipMutation } from "@/lib/react-query/mutations/delete-relationship-mutation";
import { useUpdateRelationshipMutation } from "@/lib/react-query/mutations/update-relationship-mutation";
import { useUser } from "@/lib/valtio/queries/user-store-queries";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "../ui/item";
import { Button } from "../ui/button";
import { FilterInput } from "../filter-input";

export function UserDashboardRequests() {
    const { filteredRelationships, filter, setFilter } = useFilteredRelationships(RELATIONSHIP_STATUS.PENDING);
    const user = useUser();
    const { mutate: deleteRelationship } = useDeleteRelationshipMutation();
    const { mutate: updateRelationship } = useUpdateRelationshipMutation();

    function handleDeclineRelationship(relationshipId: string) {
        deleteRelationship({ id: relationshipId });
    }

    function handleAcceptRelationship(relationshipId: string) {
        updateRelationship({ id: relationshipId, status: RELATIONSHIP_STATUS.FRIEND });
    }

    return (
        <div className="grid grid-cols-1 grid-rows-[50px_1fr_min-content] overflow-hidden">
            <div className="flex items-center space-x-1 border-b px-4">
                <HeartHandshakeIcon className="size-5 text-muted-foreground" />
                <h1 className="font-medium">Friends</h1>
            </div>
            <div className="space-y-3 p-3">
                <FilterInput filterValue={filter} onChange={setFilter} resultsCount={filteredRelationships.length} />
                <div className="flex flex-col overflow-auto">
                    {filteredRelationships.map((r) => (
                        <Item variant="outline">
                            <ItemMedia>
                                <AvatarWithFallback src={r.user.avatar} fallback={r.user.displayName} size="lg" />
                            </ItemMedia>
                            <ItemContent>
                                <ItemTitle>{r.user.displayName}</ItemTitle>
                                <ItemDescription>{r.user.username}</ItemDescription>
                            </ItemContent>
                            <ItemActions>
                                <Button size="sm" variant="destructive" onClick={() => handleDeclineRelationship(r.id)}>
                                    <BanIcon />
                                    <span>{user.id === r.creatorId ? "Cancel" : "Decline"}</span>
                                </Button>
                                {user.id !== r.creatorId && (
                                    <Button size="sm" onClick={() => handleAcceptRelationship(r.id)}>
                                        <HeartHandshakeIcon />
                                        <span>Accept</span>
                                    </Button>
                                )}
                            </ItemActions>
                        </Item>
                    ))}
                </div>
            </div>
        </div>
    );
}
