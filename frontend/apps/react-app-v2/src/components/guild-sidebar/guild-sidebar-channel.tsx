import { isGuildTextChannel } from "@/lib/types/guards";
import type { GuildTextChannelType, GuildVoiceChannelType, Snapshot } from "@/lib/types/types";
import { GuildSidebarTextChannel } from "./guild-sidebar-text-channel";
import { GuildSidebarVoiceChannel } from "./guild-sidebar-voice-channel";
import { useNavigate, useParams } from "@tanstack/react-router";
import { GuildSidebarChannelContextMenu } from "./guild-sidebar-channel-context-menu";
import { useDraggable } from "@dnd-kit/react";

type GuildSidebarChannelProps = {
    channel: Snapshot<GuildTextChannelType | GuildVoiceChannelType>;
    sub?: boolean;
};

export function GuildSidebarChannel({ channel, sub = false }: GuildSidebarChannelProps) {
    const params = useParams({
        from: "/_auth/app/$guildId/$channelId",
        shouldThrow: false,
    });

    const { ref } = useDraggable({
        id: channel.id,
        data: { id: channel.id, name: channel.name, topic: channel.topic },
    });

    const navigate = useNavigate();
    function handleChannelClick() {
        navigate({
            to: "/app/$guildId/$channelId",
            params: { channelId: channel.id, guildId: channel.guildId },
        });
    }

    return (
        <GuildSidebarChannelContextMenu
            channelType={channel.channelType}
            guildId={channel.guildId}
            id={channel.id}
            name={channel.name}
        >
            {isGuildTextChannel(channel) ? (
                <GuildSidebarTextChannel
                    channel={channel}
                    onClick={handleChannelClick}
                    isActive={channel.id === params?.channelId}
                    sub={sub}
                    ref={ref}
                />
            ) : (
                <GuildSidebarVoiceChannel
                    channel={channel}
                    onClick={handleChannelClick}
                    isActive={channel.id === params?.channelId}
                    sub={sub}
                    ref={ref}
                />
            )}
        </GuildSidebarChannelContextMenu>
    );
}
