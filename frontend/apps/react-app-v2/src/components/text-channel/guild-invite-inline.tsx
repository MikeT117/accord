import { useInView } from "react-intersection-observer";
import { Button } from "../ui/button";
import { useGuildInviteQuery } from "@/lib/react-query/queries/guild-invite-query";
import { Item, ItemActions, ItemContent, ItemDescription, ItemFooter, ItemMedia, ItemTitle } from "../ui/item";
import { useIsGuildMember } from "@/lib/valtio/queries/guild-store-queries";
import { TriangleAlertIcon } from "lucide-react";
import { useCreateGuildMember } from "@/lib/react-query/mutations/create-guild-member-mutation";
import { GuildIcon } from "../guild-icon";
import { env } from "@/lib/constants";

export const GuildInviteInline = ({ inviteId }: { inviteId: string }) => {
    const { ref, inView } = useInView({ threshold: 0.9 });
    const { data, isSuccess, isError } = useGuildInviteQuery({ id: inviteId, enabled: inView });
    const isMember = useIsGuildMember(data?.guildId ?? "");
    const { mutate } = useCreateGuildMember();

    function handleAcceptInviteClick() {
        if (!data || !isSuccess || isError) {
            return;
        }

        mutate({ guildId: data.guildId, inviteId });
    }

    return (
        <div ref={ref} className="mt-2 max-w-[400px]">
            {isSuccess ? (
                <Item variant="outline" className="group relative overflow-hidden">
                    <img
                        src={`${env.CLOUDINARY_RES_URL}/${data.banner}`}
                        alt="Profile banner"
                        className="absolute left-0 z-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 z-0 bg-gradient-to-t from-card via-card/60 to-transparent" />

                    <ItemMedia variant="image">
                        <GuildIcon icon={data.icon} name={data.name} />
                    </ItemMedia>
                    <ItemContent className="z-1">
                        <ItemTitle>{data.name}</ItemTitle>
                        <ItemDescription className="text-xs">{data.description}</ItemDescription>
                        <ItemFooter>
                            <span className="mt-2 text-xs text-muted-foreground">Members: {data.memberCount}</span>
                        </ItemFooter>
                    </ItemContent>
                    <ItemActions>
                        <Button size="sm" variant="outline" disabled={isMember} onClick={handleAcceptInviteClick}>
                            {isMember ? "Joined" : "Join"}
                        </Button>
                    </ItemActions>
                </Item>
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
