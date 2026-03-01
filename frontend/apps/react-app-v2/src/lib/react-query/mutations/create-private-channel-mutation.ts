import { httpClient } from "@/lib/http-client";
import { handlePrivateChannelCreated } from "@/lib/valtio/mutations/private-channel-mutations";
import { PRIVATE_CHANNEL_TYPE, privateChannelSchema } from "@/lib/zod-validation/channel-schema";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

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

type MutationHookArgs = {
    onSuccess?: () => void;
    userIds: string[];
};

export const useCreatePrivateChannelMutation = (args?: MutationHookArgs) => {
    return useMutation({
        mutationFn: mutationFnTest,
        ...args,
        onError: () => {
            toast("An error occurred while creating channel, please try again later.");
        },
    });
};
