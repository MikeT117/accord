import { useState } from 'react';
import { usePrivateChannelStore } from '@/shared-stores/privateChannelStore';
import { useCurrentUserId } from '../../../../shared-stores/currentUserStore';
import { useParams } from 'react-router-dom';

export const useFilteredPrivateChannels = () => {
    const [filter, setFilter] = useState('');

    const { channelId = '' } = useParams();

    const userId = useCurrentUserId();
    const channels = usePrivateChannelStore((s) => s.ids.map((i) => s.channels[i]!));

    const filteredChannels = (() => {
        if (filter.trim().length === 0) {
            return channels;
        }

        return channels.filter((c) =>
            c.users.some(
                (r) =>
                    r.id !== userId &&
                    r.displayName.toLocaleLowerCase().includes(filter.toLocaleLowerCase()),
            ),
        );
    })();

    return {
        filter,
        channels: filteredChannels,
        activeChannelId: channelId,
        setFilter,
    };
};
