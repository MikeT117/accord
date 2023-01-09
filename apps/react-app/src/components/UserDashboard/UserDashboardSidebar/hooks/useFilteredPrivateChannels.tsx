import { useCallback, useMemo, useState } from 'react';
import { usePrivateChannelStore } from '@/shared-stores/privateChannelStore';

import { useLoggedInUserId } from '../../../../shared-stores/loggedInUserStore';
import { useParams } from 'react-router-dom';

export const useFilteredPrivateChannels = () => {
  const userId = useLoggedInUserId();
  const { channelId = '' } = useParams();
  const [filter, setFilter] = useState('');
  const channels = usePrivateChannelStore(useCallback((s) => s.ids.map((i) => s.channels[i]!), []));
  const filteredChannels = useMemo(
    () =>
      filter.trim().length !== 0
        ? channels.filter((c) =>
            c.members.some(
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
