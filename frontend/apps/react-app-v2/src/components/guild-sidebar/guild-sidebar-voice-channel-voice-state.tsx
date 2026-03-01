import type { VoiceStateType } from "@/lib/types/types";
import { MicIcon, MicOffIcon } from "lucide-react";
import { SidebarMenuSubItem } from "../ui/sidebar";
import { AvatarWithFallback } from "../avatar-with-fallback";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "../ui/context-menu";

export function GuildSidebarVoiceChannelVoiceState({
    voiceState,
    onMute,
}: {
    voiceState: VoiceStateType;
    onMute: () => void;
}) {
    return (
        <ContextMenu>
            <ContextMenuTrigger>
                <SidebarMenuSubItem className="flex items-center space-x-2 rounded-md border bg-white/5 px-2 py-1">
                    <AvatarWithFallback fallback={voiceState.user.displayName} src={voiceState.user.avatar} size="sm" />
                    <span className="font-medium">{voiceState.user.displayName}</span>
                    <div className="ml-auto flex items-center">
                        {voiceState.selfMute ? (
                            <MicOffIcon className="size-4 text-red-400" />
                        ) : (
                            <MicIcon className="size-4 text-green-400" />
                        )}
                    </div>
                </SidebarMenuSubItem>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-40">
                <ContextMenuItem onClick={onMute}>{voiceState.selfMute ? "Unmute" : "Mute"}</ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
}
