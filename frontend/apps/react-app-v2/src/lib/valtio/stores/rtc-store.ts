import { proxy } from "valtio";
import { devtools } from "valtio/utils";

type RTCStoreType = {
    connectionState: RTCPeerConnectionState;
};

export const rtcStore = proxy<RTCStoreType>({ connectionState: "closed" });
devtools(rtcStore, { name: "rtc store", enabled: true });
