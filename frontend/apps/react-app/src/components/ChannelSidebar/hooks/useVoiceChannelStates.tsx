import { useVoiceStateStore } from '@/shared-stores/voiceStateStore';

export const useVoiceChannelStates = (channelId: string) => {
    const voiceChannelStates = useVoiceStateStore((s) =>
        s.voiceStates.filter((vs) => vs.channelId === channelId),
    );

    return voiceChannelStates;
};
