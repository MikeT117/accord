import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { defaultPermissivePermission } from '@/utils/getChannelPermission';
import { useLoggedInUserId } from '@/shared-stores/loggedInUserStore';
import { usePrivateChannelStore } from '@/shared-stores/privateChannelStore';

export const usePrivateTextChannel = () => {
  const { channelId = '' } = useParams();
  const userId = useLoggedInUserId();

  const name = usePrivateChannelStore(useCallback((s) => s.channels[channelId]?.name, [channelId]));
  const type = usePrivateChannelStore(useCallback((s) => s.channels[channelId]?.type, [channelId]));
  const members = usePrivateChannelStore(
    useCallback((s) => s.channels[channelId]?.members, [channelId]),
  );

  if (!Array.isArray(members) || typeof type === 'undefined') {
    return null;
  }

  const recipients = members.filter((m) => m.id !== userId);
  const alternateName =
    recipients.length > 1
      ? recipients.map((r) => r.displayName).join(', ')
      : recipients[0].displayName;

  const permissions = defaultPermissivePermission();

  if (typeof type !== 'number' || recipients.length < 1) {
    return null;
  }

  return {
    channel: { id: channelId, name: name ?? alternateName, type },
    permissions,
  };
};
