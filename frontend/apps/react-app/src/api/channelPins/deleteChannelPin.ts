import { InfiniteData, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { queryClient } from '@/lib/queryClient/queryClient';
import { updateInfiniteDataItem } from '../../lib/queryClient/utils/updateInfiniteDataItem';
import { ChannelMessage } from '../../types';

type DeleteChannelPinRequestArgs = { id: string; channelId: string };

const deleteChannelPinRequest = async ({ channelId, id }: DeleteChannelPinRequestArgs) => {
    return api.delete(`/v1/channels/${channelId}/pins/${id}`);
};

export const useDeleteChannelPinMutation = () => {
    return useMutation({
        mutationFn: deleteChannelPinRequest,
        onSuccess: (_, { channelId, id }) => {
            queryClient.setQueryData<InfiniteData<ChannelMessage[]>>(
                [channelId, 'messages'],
                (prev) =>
                    updateInfiniteDataItem(prev, (m) =>
                        m.id === id ? { ...m, isPinned: false } : m,
                    ),
            );
            queryClient.invalidateQueries({ queryKey: [channelId, 'pins'] });
        },
    });
};
