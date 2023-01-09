import { useCallback } from 'react';
import { useLoggedInUserId } from '@/shared-stores/loggedInUserStore';
import { useGuildChannelStore } from '@/shared-stores/guildChannelStore';
import { useVoiceStateStore } from '@/shared-stores/voiceStateStore';
import { useGuildStore } from '../../../shared-stores/guildStore';

export const useCurrentUserVoiceState = () => {
  const userId = useLoggedInUserId();
  const voiceState = useVoiceStateStore(
    useCallback((s) => s.voiceStates.find((vs) => vs.userAccountId === userId), [userId]),
  );
  const channel = useGuildChannelStore(
    useCallback(
      (s) => (voiceState?.channelId ? s.channels[voiceState?.channelId] : undefined),
      [voiceState],
    ),
  );

  const guild = useGuildStore(
    useCallback((s) => s.guilds[voiceState?.guildId ?? ''], [voiceState]),
  );

  if (!channel || !voiceState || !guild) {
    return null;
  }

  return { guild, voiceState, channel, userId };
};
