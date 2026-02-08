import { useInView } from "react-intersection-observer";
import { GuildIcon } from "../guild-icon";
import { Button } from "../ui/button";
import { useGuildInviteQuery } from "@/lib/react-query/queries/guild-invite-query";
import { Item, ItemActions, ItemContent, ItemDescription, ItemFooter, ItemMedia, ItemTitle } from "../ui/item";
import { useGuildMemberCheck } from "@/lib/valtio/queries/guild-store-queries";
import { TriangleAlertIcon } from "lucide-react";
import { useCreateGuildMemberFromInviteMutation } from "@/lib/react-query/mutations/create-guild-member-mutation";

export const GuildInviteInline = ({ inviteId }: { inviteId: string }) => {
    const { ref, inView } = useInView({ threshold: 0.9 });
    const { data, isSuccess, isError } = useGuildInviteQuery({ id: inviteId, enabled: inView });
    const isMember = useGuildMemberCheck(data?.guildId ?? "");
    const { mutate } = useCreateGuildMemberFromInviteMutation();

    function handleAcceptInviteClick() {
        if (!data || !isSuccess || isError) {
            return;
        }

        mutate({ guildId: data.guildId, inviteId });
    }

    return (
        <div ref={ref} className="bg-grayA-3 mt-2 flex w-full max-w-[400px] flex-col rounded-md p-3">
            {isSuccess ? (
                <Item variant="outline" className="border-green-500/40 bg-green-500/5">
                    <ItemMedia>
                        <GuildIcon icon={data.icon} name={data.name} />
                    </ItemMedia>
                    <ItemContent>
                        <ItemTitle>{data.name}</ItemTitle>
                        <ItemDescription>{data.description}</ItemDescription>
                        <ItemFooter>
                            <span className="text-xs font-medium text-muted-foreground">
                                Members: {data.memberCount}
                            </span>
                        </ItemFooter>
                    </ItemContent>
                    <ItemActions>
                        <Button size="sm" variant="outline" disabled={isMember} onClick={handleAcceptInviteClick}>
                            {isMember ? "Joined" : "Join"}
                        </Button>
                    </ItemActions>
                </Item>
            ) : (
                <Item variant="outline" className="border-amber-500/40 bg-amber-500/5">
                    <ItemMedia>
                        <TriangleAlertIcon className="text-amber-500" />
                    </ItemMedia>
                    <ItemContent>
                        <ItemTitle>Invite Invalid</ItemTitle>
                        <ItemDescription>
                            This invite may be expired or invalid, please verify the link.
                        </ItemDescription>
                    </ItemContent>
                </Item>
            )}
        </div>
    );
};
