import { useRTCConnectionState } from "@/lib/valtio/queries/rtc-store-queries";
import { accordVoiceController } from "@/lib/websocket/rtc-ws";

export function useAccordVoiceController() {
    const connectionState = useRTCConnectionState();
    const { joinVoiceChannel, leaveVoiceChannel, toggleNonSelfMute, toggleSelfMute } = accordVoiceController;
    return { connectionState, joinVoiceChannel, leaveVoiceChannel, toggleNonSelfMute, toggleSelfMute };
}
