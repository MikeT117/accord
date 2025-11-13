import { httpClient } from "@/lib/http-client";
import { handleGuildChannelCreated } from "@/lib/valtio/mutations/guild-store-mutations";
import { guildChannelSchema } from "@/lib/zod-validation/channel-schema";
import { useMutation } from "@tanstack/react-query";

type mutationFnArgsType = {
    name: string;
    channelType: number;
    roleIds: string[];
    guildId: string;
};

const mutationFn = async (payload: mutationFnArgsType) => {
    return httpClient.post(`/channels`, payload).then((r) => {
        const channel = guildChannelSchema.parse(r.data);
        handleGuildChannelCreated(channel);
        return channel;
    });
};

type MutationHookArgs = {
    onSuccess?: () => void;
};

// OnError Will be handled globally with notifications, success will be handled by the component if needed.
export const useCreateGuildChannelMutation = (args?: MutationHookArgs) =>
    useMutation({ mutationFn, onSuccess: () => (typeof args?.onSuccess === "function" ? args.onSuccess() : void 0) });
