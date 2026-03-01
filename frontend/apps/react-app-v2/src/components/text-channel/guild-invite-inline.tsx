import { useInView } from "react-intersection-observer";
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "../ui/item";
import { TriangleAlertIcon } from "lucide-react";
import { useCreateGuildMember } from "@/lib/react-query/mutations/create-guild-member-mutation";
import { usePublicInviteQuery } from "@/lib/react-query/queries/public-invite-query";
import { GuildCard } from "../guild-browser/guild-card";
import { useNavigate } from "@tanstack/react-router";

export const GuildInviteInline = ({ inviteId }: { inviteId: string }) => {
    const { ref, inView } = useInView({ threshold: 0.9 });
    const { data, isSuccess, isError } = usePublicInviteQuery({ id: inviteId, enabled: inView });
    const { mutate } = useCreateGuildMember();
    const navigate = useNavigate();

    function handleAcceptInviteClick() {
        if (!data || !isSuccess || isError) {
            return;
        }

        mutate({ guildId: data.guildId, inviteId });
    }

    function handleGoToClick() {
        if (!data || !isSuccess || isError) {
            return;
        }
        navigate({ to: "/app/$guildId", params: { guildId: data.guildId } });
    }

    return (
        <div ref={ref} className="mt-2 max-w-[400px]">
            {isSuccess ? (
                <GuildCard
                    id={data.guildId}
                    name={data.name}
                    description={data.description}
                    memberCount={data.memberCount}
                    icon={data.icon}
                    banner={data.banner}
                    createdAt={data.createdAt}
                    onJoin={handleAcceptInviteClick}
                    onGoTo={handleGoToClick}
                />
            ) : (
                <Item variant="outline">
                    <ItemMedia variant="icon">
                        <TriangleAlertIcon className="text-amber-500" />
                    </ItemMedia>
                    <ItemContent>
                        <ItemTitle className="text-amber-500">Invite Invalid</ItemTitle>
                        <ItemDescription>
                            This invite may be expired or invalid, please verify the link.
                        </ItemDescription>
                    </ItemContent>
                </Item>
            )}
        </div>
    );
};
