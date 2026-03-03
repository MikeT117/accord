import { accordVoiceController } from "@/lib/websocket/rtc-ws";
import { useRTCState } from "@/lib/zustand/stores/rtc-store";

export function useAccordVoiceController() {
    const connectionState = useRTCState();
    const { joinVoiceChannel, leaveVoiceChannel, toggleNonSelfMute, toggleSelfMute } = accordVoiceController;
    return { connectionState, joinVoiceChannel, leaveVoiceChannel, toggleNonSelfMute, toggleSelfMute };
}
