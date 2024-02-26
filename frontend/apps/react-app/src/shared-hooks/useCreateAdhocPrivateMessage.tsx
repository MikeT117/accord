import { useState } from 'react';
import { useCreateChannelMessageMutation } from '../api/channelMessages/createChannelMessage';
import { useCreatePrivateChannelMutation } from '../api/channels/createPrivateChannel';

export const useCreateAdhocPrivateMessage = () => {
    const [content, setContent] = useState('');
    const { mutate: createPrivateChannel, variables: recipients } =
        useCreatePrivateChannelMutation();
    const { mutate: createChannelMessage, status } = useCreateChannelMessageMutation();

    const createMessage = (recipients: string[]) => {
        createPrivateChannel(recipients, {
            onSuccess(data) {
                createChannelMessage(
                    { channelId: data.id, content },
                    {
                        onSuccess() {
                            setContent('');
                        },
                    },
                );
            },
        });
    };

    return { content, recipients, status, setContent, createMessage };
};
