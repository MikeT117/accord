import { useCallback } from 'react';
import { useCreatePrivateChannelMutation } from '@/api/channel/createPrivateChannel';
import { useCreateChannelMessageMutation } from '@/api/message/createChannelMessage';
import { privateChannelStore } from '@/shared-stores/privateChannelStore';

export const useSendInviteToUser = () => {
  const { mutateAsync: createUserChannel } = useCreatePrivateChannelMutation();
  const { mutate: createMessage, status } = useCreateChannelMessageMutation();

  const sendInviteToUser = useCallback(
    async (inviteLink: string, recipientUserId: string) => {
      if (inviteLink) {
        const existingChannel =
          privateChannelStore.getPrivateChannelByMembers(recipientUserId) ??
          (await createUserChannel({ users: [recipientUserId] }));
        createMessage({ channelId: existingChannel.id, content: inviteLink });
      }
    },
    [createMessage, createUserChannel],
  );

  return { sendInviteToUser, status };
};
