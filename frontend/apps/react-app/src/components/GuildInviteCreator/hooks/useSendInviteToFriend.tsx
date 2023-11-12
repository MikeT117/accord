import { useCallback } from 'react';
import { useCreatePrivateChannelMutation } from '@/api/channels/createPrivateChannel';
import { useCreateChannelMessageMutation } from '@/api/channelMessages/createChannelMessage';
import { privateChannelStore } from '@/shared-stores/privateChannelStore';

export const useSendInviteToUser = () => {
  const { mutateAsync: createUserChannel } = useCreatePrivateChannelMutation();
  const { mutate: createMessage, status } = useCreateChannelMessageMutation();

  const sendInviteToUser = useCallback(
    async (inviteLink: string, recipientUserId: string) => {
      const existingChannel =
        privateChannelStore.getPrivateChannelByMembers(recipientUserId) ??
        (await createUserChannel([recipientUserId]));
      createMessage({ channelId: existingChannel.id, content: inviteLink });
    },
    [createMessage, createUserChannel],
  );

  return { sendInviteToUser, status };
};
