import { useCallback } from 'react';
import { useCurrentUserId } from '@/shared-stores/currentUserStore';
import { useVoiceStateStore } from '@/shared-stores/voiceStateStore';
import { useGuildStore } from '../../../shared-stores/guildStore';

export const useCurrentUserVoiceState = () => {
  const userId = useCurrentUserId();
  const voiceState = useVoiceStateStore(
    useCallback((s) => s.voiceStates.find((vs) => vs.userAccountId === userId), [userId]),
  );

  if (!voiceState) {
    return null;
  }

  const guild = useGuildStore(
    useCallback((s) => s.guilds[voiceState.guildId], [voiceState.guildId]),
  );

  if (!guild) {
    return null;
  }

  const channel = guild.channels.find((c) => c.id === voiceState.channelId);

  if (!channel) {
    return null;
  }

  return { guild, voiceState, channel, userId };
};
