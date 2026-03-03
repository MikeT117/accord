import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

type RTCStoreType = { connectionState: RTCPeerConnectionState };

type RTCActions = {
    setRTCState: (connectionState: RTCPeerConnectionState) => void;
};

const initialState: RTCStoreType = { connectionState: "closed" };
type RTCStore = RTCStoreType & RTCActions;

export const useRTCStore = create<RTCStore>()(
    devtools(
        immer((set) => ({
            ...initialState,
            setRTCState: (connectionState) => {
                return set((state) => {
                    state.connectionState = connectionState;
                });
            },
        })),

        { name: "rtcStore", enabled: true },
    ),
);

export const useRTCState = () => {
    return useRTCStore((s) => s.connectionState);
};

export const rtcStoreActions = {
    setRTCState: useRTCStore.getState().setRTCState,
};
