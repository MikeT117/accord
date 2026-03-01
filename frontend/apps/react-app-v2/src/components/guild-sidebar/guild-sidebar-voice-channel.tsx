import type { GuildVoiceChannelType, Snapshot } from "@/lib/types/types";
import { Volume2Icon } from "lucide-react";
import { SidebarMenuButton, SidebarMenuSub, SidebarMenuItem } from "../ui/sidebar";
import { useVoiceStates } from "@/lib/valtio/queries/guild-store-queries";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { useAccordVoiceController } from "@/hooks/use-accord-voice";
import { GuildSidebarChannelContextMenu } from "./guild-sidebar-channel-context-menu";
import { useUser } from "@/lib/valtio/queries/user-store-queries";
import { GuildSidebarVoiceChannelVoiceState } from "./guild-sidebar-voice-channel-voice-state";

type GuildSidebarVoiceChannelProps = {
    channel: Snapshot<GuildVoiceChannelType>;
    sub?: boolean;
} & Pick<React.ComponentProps<"button">, "ref">;

export function GuildSidebarVoiceChannel({ channel, ref }: GuildSidebarVoiceChannelProps) {
    const { joinVoiceChannel, toggleNonSelfMute, toggleSelfMute } = useAccordVoiceController();
    const user = useUser();
    const voiceStates = useVoiceStates(channel.guildId, channel.id);

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
                            onMute={() => (v.user.id === user.id ? toggleSelfMute() : toggleNonSelfMute(v.id))}
                        />
                    ))}
                </SidebarMenuSub>
            </CollapsibleContent>
        </Collapsible>
    );
}
