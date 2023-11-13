import { useCallback, useMemo, useState } from 'react';
import { usePrivateChannelStore } from '@/shared-stores/privateChannelStore';
import { useCurrentUserId } from '../../../../shared-stores/currentUserStore';
import { useParams } from 'react-router-dom';

export const useFilteredPrivateChannels = () => {
  const userId = useCurrentUserId();
  const { channelId = '' } = useParams();
  const [filter, setFilter] = useState('');
  const channels = usePrivateChannelStore(useCallback((s) => s.ids.map((i) => s.channels[i]!), []));
  const filteredChannels = useMemo(
    () =>
      filter.trim().length !== 0
        ? channels.filter((c) =>
            c.users.some(
              (r) =>
                r.id !== userId &&
                r.displayName.toLocaleLowerCase().includes(filter.toLocaleLowerCase()),
            ),
          )
        : channels,
    [userId, channels, filter],
  );

  return {
    channels: filteredChannels,
    filter,
    setFilter,
    activeChannelId: channelId,
  };
};
