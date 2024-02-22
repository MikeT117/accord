import { useVoiceStateStore } from '@/shared-stores/voiceStateStore';
import { useGuildStore } from '../../../shared-stores/guildStore';

export const useCurrentUserVoiceState = (userId: string) => {
    const voiceState = useVoiceStateStore((s) => s.voiceStates.find((vs) => vs.user.id === userId));
    const guild = useGuildStore((s) => (voiceState?.guildId ? s.guilds[voiceState.guildId] : null));
    if (!voiceState || !guild) {
        return null;
    }

    const channel = guild.channels.find((c) => c.id === voiceState.channelId);

    if (!channel) {
        return null;
    }

    return { guild, voiceState, channel, userId };
};
