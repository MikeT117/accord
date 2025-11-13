import type { PrivateChannelType } from "@/lib/types/types";
import { privateChannelStore } from "../stores/private-channel-store";

function resetPrivateChannelStore() {
    privateChannelStore.keys = [];
    privateChannelStore.values = {};
    privateChannelStore.initialised = false;
}

export function handlePrivateChannelStoreInitialisation(channels: PrivateChannelType[]) {
    if (privateChannelStore.initialised) {
        resetPrivateChannelStore();
    }

    channels.forEach((c) => {
        privateChannelStore.keys.push(c.id);
        privateChannelStore.values[c.id] = c;
    });
    privateChannelStore.initialised = true;
}

export function handlePrivateChannelCreated(channel: PrivateChannelType) {
    if (!privateChannelStore.keys.includes(channel.id)) {
        privateChannelStore.keys.push(channel.id);
    }
    privateChannelStore.values[channel.id] = channel;
}
