import { MessageCircleIcon, MoreHorizontalIcon, UserRoundXIcon } from "lucide-react";
import { RELATIONSHIP_STATUS } from "@/lib/zod-validation/relationship-schema";
import { UserAvatar } from "../user-avatar";
import { ButtonWithTooltip } from "../button-with-tooltip";
import { Input } from "../ui/input";
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

export function UserDashboardFriendsList() {
    const { filteredRelationships, filter, setFilter } = useFilteredRelationships(RELATIONSHIP_STATUS.FRIEND);
    const { mutate: createPrivateChannel } = useCreatePrivateChannelMutation();
    const { mutate: deleteRelationship } = useDeleteRelationshipMutation();

    const navigate = useNavigate();

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        setFilter(e.currentTarget.value);
    }

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
            <Input placeholder="Search" onChange={handleInputChange} value={filter} />
            <div className="flex flex-col overflow-auto">
                {filteredRelationships.map((r) => (
                    <div key={r.id} className="flex items-center justify-between rounded-lg p-1.5 hover:bg-accent/50">
                        <div className="flex items-center space-x-1.5">
                            <UserAvatar
                                avatar={r.user.avatar}
                                displayName={r.user.displayName}
                                className="size-6 border-none"
                            />
                            <span className="font-medium">{r.user.displayName}</span>
                        </div>
                        <div className="flex space-x-1.5">
                            <ButtonWithTooltip
                                size="icon"
                                tooltipText="Message"
                                className="size-8"
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
                                        className="size-8 data-[state=open]:bg-accent dark:data-[state=open]:bg-accent/50"
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
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
