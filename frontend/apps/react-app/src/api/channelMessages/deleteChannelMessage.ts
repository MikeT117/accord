import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { queryClient } from '@/lib/queryClient/queryClient';
import { InfiniteData } from '@tanstack/react-query';
import { deleteInfiniteDataItem } from '../../lib/queryClient/utils/deleteInfiniteDataItem';
import { ChannelMessage } from '../../types';

type DeleteChannelMessageRequestArgs = {
    id: string;
    channelId: string;
};

const deleteChannelMessageRequest = ({ channelId, id }: DeleteChannelMessageRequestArgs) => {
    return api.delete(`/v1/channels/${channelId}/messages/${id}`);
};

export const useDeleteChannelMessageMutation = () => {
    return useMutation({
        mutationFn: deleteChannelMessageRequest,
        onSuccess: (_, args) => {
            queryClient.setQueryData<InfiniteData<ChannelMessage[]>>(
                [args.channelId, 'messages'],
                (prev) => deleteInfiniteDataItem(prev, (m) => m.id !== args.id),
            );
        },
    });
};
