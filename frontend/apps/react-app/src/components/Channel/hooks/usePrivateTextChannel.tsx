import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useCurrentUserId } from '@/shared-stores/currentUserStore';
import { usePrivateChannelStore } from '@/shared-stores/privateChannelStore';

export const usePrivateTextChannel = () => {
  const { channelId = '' } = useParams();
  const userId = useCurrentUserId();
  const channel = usePrivateChannelStore(useCallback((s) => s.channels[channelId], []));

  if (!channel) {
    return null;
  }

  const recipients = channel.users.filter((m) => m.id !== userId);
  const name =
    recipients.length > 1
      ? recipients.map((r) => r.displayName).join(', ')
      : recipients[0].displayName;

  return { channel: { ...channel, name }, permissions: 2147483647 };
};
