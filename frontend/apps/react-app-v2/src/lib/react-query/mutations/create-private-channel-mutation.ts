import { httpClient } from "@/lib/http-client";
import { handlePrivateChannelCreated } from "@/lib/valtio/mutations/private-channel-mutations";
import { PRIVATE_CHANNEL_TYPE, privateChannelSchema } from "@/lib/zod-validation/channel-schema";
import { useMutation } from "@tanstack/react-query";

type mutationFnArgsType = {
    userIds: string[];
};

export const mutationFnTest = async (payload: mutationFnArgsType) => {
    return httpClient
        .post(`/channels`, {
            ...payload,
            channelType:
                payload.userIds.length < 2
                    ? PRIVATE_CHANNEL_TYPE.PRIVATE_DIRECT_CHANNEL
                    : PRIVATE_CHANNEL_TYPE.PRIVATE_GROUP_CHANNEL,
        })
        .then((r) => {
            const channel = privateChannelSchema.parse(r.data);
            handlePrivateChannelCreated(channel);
            return channel;
        });
};

type MutationHookArgs = Omit<Parameters<typeof useMutation>[0], "mutationFn">;

// OnError Will be handled globally with notifications, success will be handled by the component if needed.
export const useCreatePrivateChannelMutation = (args?: MutationHookArgs) =>
    useMutation({ mutationFn: mutationFnTest, ...args });
