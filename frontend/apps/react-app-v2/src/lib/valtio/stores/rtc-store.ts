import { proxy } from "valtio";

type RTCStoreType = {
    connectionState: RTCPeerConnectionState;
};

export const rtcStore = proxy<RTCStoreType>({ connectionState: "closed" });
