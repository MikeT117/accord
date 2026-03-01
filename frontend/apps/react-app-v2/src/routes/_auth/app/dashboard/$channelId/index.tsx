import { RootErrorComponent } from "@/components/error/error-component";
import { ChannelMessage } from "@/components/text-channel/channel-message";
import { ChannelMessageCreator } from "@/components/text-channel/channel-message-creator";
import { PinnedMessagesPopover } from "@/components/text-channel/pinned-messages-popover";
import { TextChannel } from "@/components/text-channel/text-channel";
import { ErrChannelNotFound } from "@/lib/error";
import { useCreateChannelPinMutation } from "@/lib/react-query/mutations/create-channel-pin-mutation";
import { useDeleteChannelMessageMutation } from "@/lib/react-query/mutations/delete-channel-message-mutation";
import { useDeleteChannelPinMutation } from "@/lib/react-query/mutations/delete-channel-pin-mutation";
import {
    channelMessageQueryOptions,
    useSuspenseInfiniteChannelMessagesQuery,
} from "@/lib/react-query/queries/channel-message-query";
import { doesPrivateChannelExist, usePrivateChannel } from "@/lib/valtio/queries/private-channel-store-queries";
import { useUser } from "@/lib/valtio/queries/user-store-queries";
import { createFileRoute, notFound } from "@tanstack/react-router";

type RouteQueryOptions = {
    before?: string | null | undefined;
};

export const Route = createFileRoute("/_auth/app/dashboard/$channelId/")({
    validateSearch: (search: Record<string, unknown>): RouteQueryOptions => ({
        before: (search.before as string) || undefined,
    }),
    loaderDeps: ({ search }) => ({ before: search.before }),
    loader: ({ context: { queryClient }, params: { channelId } }) =>
        queryClient.ensureInfiniteQueryData(channelMessageQueryOptions({ channelId })),
    errorComponent: (errProps) => <RootErrorComponent {...errProps} />,
    component: RouteComponent,
});

function RouteComponent() {
    const { channelId } = Route.useParams();
    const user = useUser();
    const channel = usePrivateChannel(channelId);
    const { data, infiniteScrollRef } = useSuspenseInfiniteChannelMessagesQuery({ channelId });

    const { mutate: pinMessage } = useCreateChannelPinMutation();
    const { mutate: unpinMessage } = useDeleteChannelPinMutation();
    const { mutate: deleteMessage } = useDeleteChannelMessageMutation();

    const channelName = channel.users.map((u) => `${u.displayName}`).join(", ");

    return (
        <TextChannel
            name={channelName}
            pinnedMessages={<PinnedMessagesPopover channelId={channel.id} canUnpinMessage={true} />}
            messageCreator={
                <ChannelMessageCreator channelId={channel.id} channelName={channelName} canCreateMessage={true} />
            }
            messages={data.map((msg, i) => (
                <ChannelMessage
                    key={msg.id}
                    forwardedRef={(e) => infiniteScrollRef(i, e)}
                    message={msg}
                    onDeleteMessage={deleteMessage}
                    onPinMessage={pinMessage}
                    onUnpinMessage={unpinMessage}
                    canDeleteMessage={msg.author.id === user.id}
                    canPinMessage={true}
                    canEditMessage={msg.author.id === user.id}
                />
            ))}
        />
    );
}
