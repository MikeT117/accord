import type { GuildRolePermissionsType, GuildVoiceChannelType } from "@/lib/types/types";
import { Volume2Icon } from "lucide-react";
import { SidebarMenuButton, SidebarMenuSub, SidebarMenuItem } from "../ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { useAccordVoiceController } from "@/hooks/use-accord-voice";
import { GuildSidebarChannelContextMenu } from "./guild-sidebar-channel-context-menu";
import { GuildSidebarVoiceChannelVoiceState } from "./guild-sidebar-voice-channel-voice-state";
import { useChannelVoiceStates } from "@/lib/zustand/stores/guild-store";

type GuildSidebarVoiceChannelProps = {
    currentUserId: string;
    channel: GuildVoiceChannelType;
    permissions: GuildRolePermissionsType;
    sub?: boolean;
} & Pick<React.ComponentProps<"button">, "ref">;

export function GuildSidebarVoiceChannel({ currentUserId, permissions, channel, ref }: GuildSidebarVoiceChannelProps) {
    const { joinVoiceChannel, toggleNonSelfMute, toggleSelfMute } = useAccordVoiceController();
    const voiceStates = useChannelVoiceStates(channel.guildId, channel.id);

    return (
        <Collapsible
            key={channel.id}
            className="group/collapsible"
            open={voiceStates.length !== 0}
            onOpenChange={void 0}
        >
            <GuildSidebarChannelContextMenu
                channelType={channel.channelType}
                guildId={channel.guildId}
                id={channel.id}
                name={channel.name}
                permissions={permissions}
            >
                <CollapsibleTrigger asChild>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            className="cursor-pointer select-none"
                            ref={ref}
                            onClick={() => joinVoiceChannel(channel.guildId, channel.id)}
                        >
                            <Volume2Icon />
                            {channel.name}
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </CollapsibleTrigger>
            </GuildSidebarChannelContextMenu>
            <CollapsibleContent className="mb-2">
                <SidebarMenuSub>
                    {voiceStates.map((v) => (
                        <GuildSidebarVoiceChannelVoiceState
                            key={v.id}
                            voiceState={v}
                            onMute={() => (v.user.id === currentUserId ? toggleSelfMute() : toggleNonSelfMute(v.id))}
                        />
                    ))}
                </SidebarMenuSub>
            </CollapsibleContent>
        </Collapsible>
    );
}
