import { useSnapshot } from "valtio";
import { rtcStore } from "../stores/rtc-store";

export function useRTCConnectionState() {
    const rtcStoreSnapshot = useSnapshot(rtcStore);
    return rtcStoreSnapshot.connectionState;
}
