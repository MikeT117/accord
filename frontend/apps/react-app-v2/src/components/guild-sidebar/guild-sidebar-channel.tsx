import { isGuildTextChannel } from "@/lib/types/guards";
import type { GuildRolePermissionsType, GuildTextChannelType, GuildVoiceChannelType } from "@/lib/types/types";
import { GuildSidebarVoiceChannel } from "./guild-sidebar-voice-channel";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useDraggable } from "@dnd-kit/react";
import { GuildSidebarTextChannel } from "./guild-sidebar-text-channel";

type GuildSidebarChannelProps = {
    currentUserId: string;
    permissions: GuildRolePermissionsType;
    channel: GuildTextChannelType | GuildVoiceChannelType;
    sub?: boolean;
};

export function GuildSidebarChannel({ permissions, currentUserId, channel, sub = false }: GuildSidebarChannelProps) {
    const params = useParams({
        from: "/_auth/app/$guildId/$channelId/",
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

    if (isGuildTextChannel(channel)) {
        return (
            <GuildSidebarTextChannel
                channel={channel}
                onClick={handleChannelClick}
                isActive={channel.id === params?.channelId}
                ref={ref}
                permissions={permissions}
            />
        );
    }

    return (
        <GuildSidebarVoiceChannel
            channel={channel}
            sub={sub}
            ref={ref}
            permissions={permissions}
            currentUserId={currentUserId}
        />
    );
}
