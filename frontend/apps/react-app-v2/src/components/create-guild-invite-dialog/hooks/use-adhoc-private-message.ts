import { useCreateChannelMessageMutation } from "@/lib/react-query/mutations/create-channel-message-mutation";
import { useCreatePrivateChannelMutation } from "@/lib/react-query/mutations/create-private-channel-mutation";
import { getPrivateDirectChannelIdByUserId } from "@/lib/zustand/stores/private-channel-store";

export function useAdhocPrivateMessage() {
    const { mutate: createMessage } = useCreateChannelMessageMutation();
    const { mutate: createPrivateChannel } = useCreatePrivateChannelMutation();

    function createAdhocPrivateMessage(userId: string, content: string) {
        if (!content.trim().length) {
            return;
        }

        const existingChannelId = getPrivateDirectChannelIdByUserId(userId);

        if (!existingChannelId) {
            createPrivateChannel(
                { userIds: [userId] },
                {
                    onSuccess(channel) {
                        createMessage({ channelId: channel.id, content });
                    },
                },
            );
        } else {
            createMessage({ channelId: existingChannelId, content });
        }
    }

    return createAdhocPrivateMessage;
}
