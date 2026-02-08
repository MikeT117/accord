import { useCurrentUserVoiceState } from "@/lib/valtio/queries/guild-store-queries";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { ButtonWithTooltip } from "../button-with-tooltip";
import { AudioWaveformIcon, MicIcon, MicOffIcon, PhoneOffIcon } from "lucide-react";
import { useAccordVoiceController } from "@/hooks/use-accord-voice";
import { GuildIcon } from "../guild-icon";

export function AppSidebarActiveVoice() {
    const { leaveVoiceChannel, toggleSelfMute, connectionState } = useAccordVoiceController();
    const currentUserVoiceState = useCurrentUserVoiceState();
    const isConnected = connectionState === "connected";

    if (!currentUserVoiceState) {
        return null;
    }

    return (
        <div className="flex flex-col space-y-1.5 rounded-md border p-1">
            <HoverCard openDelay={5} closeDelay={50}>
                <HoverCardTrigger className="inline-flex size-8 items-center justify-center gap-2 rounded-md bg-green-400/20">
                    <AudioWaveformIcon className="size-4 shrink-0 text-green-400/75" />
                </HoverCardTrigger>
                <HoverCardContent
                    className="flex w-64 gap-4 p-2"
                    side="right"
                    align="start"
                    alignOffset={-4}
                    sideOffset={12}
                >
                    <GuildIcon
                        name={currentUserVoiceState.guild.name}
                        icon={currentUserVoiceState.guild.icon}
                        className="size-8 border-none"
                    />
                    <div className="flex flex-col space-y-1">
                        <span className="text-xs">{isConnected ? "Voice Connected" : "Voice Not Connected"}</span>
                        <span className="text- overflow-hidden text-xs text-ellipsis">{`${currentUserVoiceState.guild.name} / ${currentUserVoiceState.channel.name}`}</span>
                    </div>
                </HoverCardContent>
            </HoverCard>
            <ButtonWithTooltip
                aria-label={currentUserVoiceState.voiceState.selfMute ? "Unmute" : "Mute"}
                variant={currentUserVoiceState.voiceState.selfMute ? "destructive" : "outline"}
                className="size-8"
                tooltipText={currentUserVoiceState.voiceState.selfMute ? "Unmute" : "Mute"}
                onClick={toggleSelfMute}
            >
                {currentUserVoiceState.voiceState.selfMute ? <MicOffIcon /> : <MicIcon />}
            </ButtonWithTooltip>

            <ButtonWithTooltip
                aria-label="Disconnect Voice"
                variant="outline"
                className="size-8"
                onClick={leaveVoiceChannel}
                tooltipText="Disconnect Voice"
            >
                <PhoneOffIcon />
            </ButtonWithTooltip>
        </div>
    );
}
