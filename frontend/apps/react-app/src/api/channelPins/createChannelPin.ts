import { InfiniteData, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { queryClient } from '@/lib/queryClient/queryClient';
import { updateInfiniteDataItem } from '../../lib/queryClient/utils/updateInfiniteDataItem';
import { ChannelMessage } from '../../types';

type CreateChannelPinRequestArgs = { id: string; channelId: string };

const createChannelPinRequest = async ({ channelId, id }: CreateChannelPinRequestArgs) => {
    return api.put(`/v1/channels/${channelId}/pins/${id}`);
};

export const useCreateChannelPinMutation = () => {
    return useMutation({
        mutationFn: createChannelPinRequest,
        onSuccess: (_, { channelId, id }) => {
            queryClient.setQueryData<InfiniteData<ChannelMessage[]>>(
                [channelId, 'messages'],
                (prev) =>
                    updateInfiniteDataItem(prev, (m) =>
                        m.id === id ? { ...m, isPinned: true } : m,
                    ),
            );
            queryClient.invalidateQueries({ queryKey: [channelId, 'pins'] });
        },
    });
};
