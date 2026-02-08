import { rtcStore } from "../stores/rtc-store";

export function setRTCConnectionState(connectionState: RTCPeerConnectionState) {
    rtcStore.connectionState = connectionState;
}
