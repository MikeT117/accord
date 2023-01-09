import { useCallback } from 'react';
import { useVoiceStateStore } from '@/shared-stores/voiceStateStore';

export const useVoiceChannelStates = (channelId: string) => {
  const voiceChannelStates = useVoiceStateStore(
    useCallback((s) => s.voiceStates.filter((vs) => vs.channelId === channelId), [channelId]),
  );

  return voiceChannelStates;
};
