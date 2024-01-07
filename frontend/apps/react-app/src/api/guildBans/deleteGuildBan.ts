import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { queryClient } from '@/lib/queryClient/queryClient';

type DeleteGuildBanMutationArgs = {
    id: string;
    guildId: string;
};

const deleteGuildBanRequest = ({ id, guildId }: DeleteGuildBanMutationArgs) => {
    return api.delete(`/v1/guilds/${guildId}/bans/${id}`);
};

export const useDeleteGuildBanMutation = () => {
    return useMutation({
        mutationFn: deleteGuildBanRequest,
        onSuccess: (_, args) => {
            queryClient.invalidateQueries({ queryKey: [args.guildId, 'bans'] });
        },
    });
};
