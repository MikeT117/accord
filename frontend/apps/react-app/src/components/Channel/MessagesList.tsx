import { useDeleteChannelMessageMutation } from '@/api/channelMessages/deleteChannelMessage';
import { useInfiniteChannelMessagesQuery } from '@/api/channelMessages/getChannelMessages';
import { MainContentBodyLayout } from '@/shared-components/Layouts';
import { LoadingSpinner } from '@/shared-components/LoadingSpinner';
import { MessageListItem } from '@/shared-components/Message/MessageListItem';
import { InfiniteLoad } from '@/shared-components/InfiniteLoad';
import { useUpdateChannelMessageMutation } from '../../api/channelMessages/updateChannelMessage';
import { useCreateChannelPinMutation } from '../../api/channelPins/createChannelPin';
import { useDeleteChannelPinMutation } from '../../api/channelPins/deleteChannelPin';
import { useCurrentUserId } from '../../shared-stores/currentUserStore';

export const MessagesList = ({
    channelId,
    permissions,
}: {
    channelId: string;
    permissions: number;
}) => {
    const userId = useCurrentUserId();
    const { data, isLoading, fetchNextPage, fetchPreviousPage, hasNextPage, hasPreviousPage } =
        useInfiniteChannelMessagesQuery(channelId);

    const { mutate: updateMessage } = useUpdateChannelMessageMutation();
    const { mutate: deleteMessage } = useDeleteChannelMessageMutation();
    const { mutate: pinMessage } = useCreateChannelPinMutation();
    const { mutate: unpinMessage } = useDeleteChannelPinMutation();

    return (
        <MainContentBodyLayout>
            {isLoading ? (
                <LoadingSpinner />
            ) : (
                <ul className='flex h-full flex-col-reverse overflow-y-auto pb-4 pt-[32px]'>
                    <InfiniteLoad enabled={hasPreviousPage} onInView={fetchPreviousPage} />
                    {data?.pages.map((p) =>
                        p.map((m) => (
                            <MessageListItem
                                key={m.id}
                                message={m}
                                permissions={permissions}
                                isAuthorCurrentUser={m.author.id === userId}
                                onDeleteMessage={deleteMessage}
                                onPinMessage={pinMessage}
                                onUnpinMessage={unpinMessage}
                                onUpdateMessage={updateMessage}
                            />
                        )),
                    )}
                    <InfiniteLoad enabled={hasNextPage} onInView={fetchNextPage} />
                </ul>
            )}
        </MainContentBodyLayout>
    );
};
