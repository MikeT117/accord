import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { Normalize, PrivateChannelType } from "@/lib/types/types";
import { ErrChannelNotFound } from "../../error";
import { useShallow } from "zustand/react/shallow";
import { PRIVATE_CHANNEL_TYPE } from "../../zod-validation/channel-schema";

type PrivateChannelStoreType = Normalize<PrivateChannelType> & { initialised: boolean };

type PrivateChannelActions = {
    initialise: (channels: PrivateChannelType[]) => void;
    createChannel: (channel: PrivateChannelType) => void;
};

const initialState: PrivateChannelStoreType = { initialised: false, keys: [], values: {} };
type RelationshipStore = PrivateChannelStoreType & PrivateChannelActions;

export const usePrivateChannelStore = create<RelationshipStore>()(
    devtools(
        immer((set) => ({
            ...initialState,
            initialise: (channels) => {
                return set((state) => {
                    for (const channel of channels) {
                        state.keys.push(channel.id);
                        state.values[channel.id] = channel;
                    }
                    state.initialised = true;
                });
            },
            createChannel: (channel) => {
                return set((state) => {
                    state.keys.push(channel.id);
                    state.values[channel.id] = channel;
                });
            },
        })),

        { name: "privateChannelStore", enabled: true },
    ),
);

export const usePrivateChannels = () => {
    return usePrivateChannelStore(useShallow((s) => s.keys.map((k) => s.values[k]!)));
};

export const usePrivateChannel = (channelId: string) => {
    const channel = usePrivateChannelStore((s) => s.values[channelId]);

    if (!channel) {
        throw new ErrChannelNotFound();
    }

    return { ...channel, name: channel.users.map((u) => `${u.displayName}`).join(", ") };
};

export function getPrivateDirectChannelIdByUserId(userId: string) {
    for (const key of usePrivateChannelStore.getState().keys) {
        if (
            usePrivateChannelStore.getState().values[key]!.channelType ===
                PRIVATE_CHANNEL_TYPE.PRIVATE_DIRECT_CHANNEL &&
            usePrivateChannelStore.getState().values[key]!.users.some((u) => u.id === userId)
        ) {
            return key;
        }
    }
}

export const privateChannelStoreActions = {
    initialise: usePrivateChannelStore.getState().initialise,
    createChannel: usePrivateChannelStore.getState().createChannel,
};
