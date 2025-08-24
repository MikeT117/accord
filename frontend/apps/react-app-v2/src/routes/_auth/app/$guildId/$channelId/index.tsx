import { RootErrorComponent } from "@/components/error/error-component";
import { ChannelMessage } from "@/components/text-channel/channel-message";
import { ChannelMessageCreator } from "@/components/text-channel/channel-message-creator";
import { PinnedMessagesPopover } from "@/components/text-channel/pinned-messages-popover";
import { TextChannel } from "@/components/text-channel/text-channel";
import { useUserGuildChannelPermissions } from "@/lib/authorisation/permissions";
import { useCreateChannelPinMutation } from "@/lib/react-query/mutations/create-channel-pin-mutation";
import { useDeleteChannelMessageMutation } from "@/lib/react-query/mutations/delete-channel-message-mutation";
import { useDeleteChannelPinMutation } from "@/lib/react-query/mutations/delete-channel-pin-mutation";
import {
    channelMessageQueryOptions,
    useSuspenseInfiniteChannelMessagesQuery,
} from "@/lib/react-query/queries/channel-message-query";
import { useGuildTextChannel } from "@/lib/valtio/queries/guild-store-queries";
import { useUser } from "@/lib/valtio/queries/user-store-queries";
import { createFileRoute } from "@tanstack/react-router";

type RouteQueryOptions = {
    before?: string | null | undefined;
};

export const Route = createFileRoute("/_auth/app/$guildId/$channelId/")({
    validateSearch: (search: Record<string, unknown>): RouteQueryOptions => {
        return { before: (search.before as string) || undefined };
    },
    loaderDeps: ({ search }) => ({ before: search.before }),
    loader: ({ context: { queryClient }, params: { channelId } }) => {
        return queryClient.ensureInfiniteQueryData(channelMessageQueryOptions({ channelId }));
    },
    errorComponent: (errProps) => <RootErrorComponent {...errProps} />,
    component: RouteComponent,
});

function RouteComponent() {
    const { guildId, channelId } = Route.useParams();
    const user = useUser();
    const channel = useGuildTextChannel(guildId, channelId);
    const permissions = useUserGuildChannelPermissions(guildId, channelId);
    const { data, infiniteScrollRef } = useSuspenseInfiniteChannelMessagesQuery({ channelId });

    const { mutate: pinMessage } = useCreateChannelPinMutation();
    const { mutate: unpinMessage } = useDeleteChannelPinMutation();
    const { mutate: deleteMessage } = useDeleteChannelMessageMutation();

    return (
        <TextChannel
            name={channel.name}
            pinnedMessages={
                <PinnedMessagesPopover channelId={channel.id} canUnpinMessage={permissions.CreateChannelPin} />
            }
            messageCreator={
                <ChannelMessageCreator
                    channelId={channel.id}
                    channelName={`#${channel.name}`}
                    canCreateMessage={permissions.CreateChannelMessage}
                />
            }
            messages={data.map((msg, i) => (
                <ChannelMessage
                    key={msg.id}
                    forwardedRef={(e) => infiniteScrollRef(i, e)}
                    message={msg}
                    onDeleteMessage={deleteMessage}
                    onPinMessage={pinMessage}
                    onUnpinMessage={unpinMessage}
                    canDeleteMessage={permissions.ManageChannelMessage || msg.author.id === user.id}
                    canPinMessage={permissions.CreateChannelPin}
                    canEditMessage={permissions.CreateChannelMessage && msg.author.id === user.id}
                />
            ))}
        />
    );
}
