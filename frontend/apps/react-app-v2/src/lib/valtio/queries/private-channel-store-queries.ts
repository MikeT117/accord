import { useSnapshot } from "valtio";
import { privateChannelStore } from "../stores/private-channel-store";
import { ErrChannelNotFound } from "@/lib/error";
import { PRIVATE_CHANNEL_TYPE } from "@/lib/zod-validation/channel-schema";

export function usePrivateChannelsArray() {
    const privateChannelStoreSnapshot = useSnapshot(privateChannelStore);
    return privateChannelStoreSnapshot.keys.map((k) => privateChannelStoreSnapshot.values[k]!);
}

export function usePrivateChannel(id: string) {
    const privateChannelStoreSnapshot = useSnapshot(privateChannelStore);
    const channel = privateChannelStoreSnapshot.values[id];

    if (!channel) {
        throw new ErrChannelNotFound();
    }

    return channel;
}

export function getPrivateDirectChannelIdByUserId(userId: string) {
    for (const key of privateChannelStore.keys) {
        if (
            privateChannelStore.values[key]!.channelType === PRIVATE_CHANNEL_TYPE.PRIVATE_DIRECT_CHANNEL &&
            privateChannelStore.values[key]!.users.some((u) => u.id === userId)
        ) {
            return key;
        }
    }
}
