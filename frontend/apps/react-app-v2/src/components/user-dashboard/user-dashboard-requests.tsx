import { BanIcon, HandshakeIcon, HeartHandshakeIcon } from "lucide-react";
import { RELATIONSHIP_STATUS } from "@/lib/zod-validation/relationship-schema";
import { UserAvatar } from "../user-avatar";
import { ButtonWithTooltip } from "../button-with-tooltip";
import { Input } from "../ui/input";
import { useFilteredRelationships } from "./hooks/use-filtered-relationships";
import { useDeleteRelationshipMutation } from "@/lib/react-query/mutations/delete-relationship-mutation";
import { useUpdateRelationshipMutation } from "@/lib/react-query/mutations/update-relationship-mutation";
import { useUser } from "@/lib/valtio/queries/user-store-queries";

export function UserDashboardRequests() {
    const { filteredRelationships, filter, setFilter } = useFilteredRelationships(RELATIONSHIP_STATUS.PENDING);
    const user = useUser();

    const { mutate: deleteRelationship } = useDeleteRelationshipMutation();
    const { mutate: updateRelationship } = useUpdateRelationshipMutation();

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        setFilter(e.currentTarget.value);
    }

    function handleDeclineRelationship(relationshipId: string) {
        deleteRelationship({ id: relationshipId });
    }

    function handleAcceptRelationship(relationshipId: string) {
        updateRelationship({ id: relationshipId, status: RELATIONSHIP_STATUS.FRIEND });
    }

    return (
        <div className="flex w-full flex-col overflow-hidden">
            <div className="flex space-x-2 border-b px-4 py-3.5">
                <div className="flex items-center space-x-2">
                    <HandshakeIcon className="size-5 text-muted-foreground" />
                    <h1 className="font-medium">Requests</h1>
                </div>
            </div>
            <div className="space-y-3 p-3">
                <Input placeholder="Search" onChange={handleInputChange} value={filter} />
                <div className="flex flex-col overflow-auto">
                    {filteredRelationships.map((r) => (
                        <div
                            key={r.id}
                            className="flex items-center justify-between rounded-lg p-1.5 hover:bg-accent/50"
                        >
                            <div className="flex items-center space-x-1.5">
                                <UserAvatar
                                    avatar={r.user.avatar}
                                    displayName={r.user.displayName}
                                    className="size-6 border-none"
                                />
                                <span className="font-medium">{r.user.displayName}</span>
                            </div>
                            <div className="flex space-x-1.5">
                                {user.id !== r.creatorId && (
                                    <ButtonWithTooltip
                                        size="icon"
                                        tooltipText="Accept Request"
                                        className="size-8"
                                        variant="outline"
                                        onClick={() => handleAcceptRelationship(r.id)}
                                    >
                                        <HeartHandshakeIcon />
                                    </ButtonWithTooltip>
                                )}
                                <ButtonWithTooltip
                                    size="icon"
                                    tooltipText={user.id === r.creatorId ? "Cancel Request" : "Decline Request"}
                                    className="size-8"
                                    variant="outline"
                                    onClick={() => handleDeclineRelationship(r.id)}
                                >
                                    <BanIcon />
                                </ButtonWithTooltip>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
