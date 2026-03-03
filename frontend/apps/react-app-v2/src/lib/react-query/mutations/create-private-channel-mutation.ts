import { httpClient } from "@/lib/http-client";
import { PRIVATE_CHANNEL_TYPE, privateChannelSchema } from "@/lib/zod-validation/channel-schema";
import { privateChannelStoreActions, usePrivateChannelStore } from "@/lib/zustand/stores/private-channel-store";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

type mutationFnArgsType = {
    userIds: string[];
};

export const mutationFn = async (payload: mutationFnArgsType) => {
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
            privateChannelStoreActions.createChannel(channel);
            return channel;
        });
};

type MutationHookArgs = {
    onSuccess?: () => void;
    userIds: string[];
};

export const useCreatePrivateChannelMutation = (args?: MutationHookArgs) => {
    return useMutation({
        mutationFn,
        ...args,
        onError: () => {
            toast("An error occurred while creating channel, please try again later.");
        },
    });
};
