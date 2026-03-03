import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { ButtonWithTooltip } from "../button-with-tooltip";
import { MicIcon, MicOffIcon, PhoneOffIcon } from "lucide-react";
import { useAccordVoiceController } from "@/hooks/use-accord-voice";
import { useCurrentUserVoiceState } from "@/lib/zustand/stores/guild-store";
import { GuildCard } from "../guild-card";
import { AvatarWithFallback } from "../avatar-with-fallback";

export function AppSidebarActiveVoice() {
    const { leaveVoiceChannel, toggleSelfMute } = useAccordVoiceController();
    const voiceState = useCurrentUserVoiceState();

    if (!voiceState) {
        return null;
    }

    return (
        <div className="flex flex-col items-center gap-1.5">
            <HoverCard openDelay={5} closeDelay={50}>
                <HoverCardTrigger>
                    <AvatarWithFallback fallback={voiceState.guild.name} src={voiceState.guild.icon} size="default" />
                </HoverCardTrigger>
                <HoverCardContent side="right" align="start" alignOffset={-220} sideOffset={14} asChild>
                    <GuildCard
                        banner={voiceState.guild.banner}
                        createdAt={voiceState.guild.createdAt}
                        description={voiceState.guild.description}
                        icon={voiceState.guild.icon}
                        id={voiceState.guild.id}
                        memberCount={voiceState.guild.memberCount}
                        name={voiceState.guild.name}
                    />
                </HoverCardContent>
            </HoverCard>
            <ButtonWithTooltip
                aria-label={voiceState.voiceState.selfMute ? "Unmute" : "Mute"}
                variant={voiceState.voiceState.selfMute ? "destructive" : "outline"}
                className="size-8"
                tooltipText={voiceState.voiceState.selfMute ? "Unmute" : "Mute"}
                onClick={toggleSelfMute}
            >
                {voiceState.voiceState.selfMute ? <MicOffIcon /> : <MicIcon />}
            </ButtonWithTooltip>
            <ButtonWithTooltip
                aria-label="Disconnect Voice"
                variant="destructive"
                className="size-8"
                onClick={leaveVoiceChannel}
                tooltipText="Disconnect Voice"
            >
                <PhoneOffIcon />
            </ButtonWithTooltip>
        </div>
    );
}
