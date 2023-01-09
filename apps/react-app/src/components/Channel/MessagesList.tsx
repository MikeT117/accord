import type { GuildRole } from '@accord/common';
import { useDeleteChannelMessageMutation } from '@/api/message/deleteChannelMessage';
import { useGetChannelMessagesQuery } from '@/api/message/getChannelMessages';
import { usePinChannelMessageMutation } from '@/api/message/pinChannelMessage';
import { useUnpinChannelMessageMutation } from '@/api/message/unpinChannelMessage';
import { useUpdateChannelMessageMutation } from '@/api/message/updateChannelMessage';
import { MainContentBodyLayout } from '@/shared-components/Layouts';
import { LoadingSpinner } from '@/shared-components/LoadingSpinner';
import { MessageListItem } from '@/shared-components/Message/MessageListItem';
import { InfiniteLoad } from '@/shared-components/InfiniteLoad';
import { useLoggedInUserId } from '../../shared-stores/loggedInUserStore';

export const MessagesList = ({
  channelId,
  permissions,
}: {
  channelId: string;
  permissions: Omit<GuildRole, 'id' | 'name' | 'guildId'>;
}) => {
  const userId = useLoggedInUserId();
  const { data, isLoading, fetchNextPage } = useGetChannelMessagesQuery(channelId);

  const { mutate: updateMessage } = useUpdateChannelMessageMutation();
  const { mutate: deleteMessage } = useDeleteChannelMessageMutation();
  const { mutate: pinMessage } = usePinChannelMessageMutation();
  const { mutate: unpinMessage } = useUnpinChannelMessageMutation();

  return (
    <MainContentBodyLayout>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <ul className='flex h-full flex-col-reverse overflow-y-auto pb-4 pt-[32px]'>
          {data?.pages.map(
            (page) =>
              Array.isArray(page) &&
              page.map((m) => (
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
          <InfiniteLoad onInView={fetchNextPage} />
        </ul>
      )}
    </MainContentBodyLayout>
  );
};
