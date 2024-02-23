import { useCreatePrivateChannelMutation } from '@/api/channels/createPrivateChannel';
import { useCreateChannelMessageMutation } from '@/api/channelMessages/createChannelMessage';
import { useCallback } from 'react';

export const useSendInviteToUser = () => {
    const { mutate: createPrivateChannel, variables } = useCreatePrivateChannelMutation();
    const { mutate: createChannelMessage, status } = useCreateChannelMessageMutation();

    const sendInviteToUser = useCallback(
        (inviteLink: string, recipientUserId: string) => {
            createPrivateChannel([recipientUserId], {
                onSuccess(data) {
                    createChannelMessage({ channelId: data.id, content: inviteLink });
                },
            });
        },
        [createPrivateChannel, createChannelMessage],
    );

    return { sendInviteToUser, status, recipientUserId: variables ? variables[0] : null };
};
