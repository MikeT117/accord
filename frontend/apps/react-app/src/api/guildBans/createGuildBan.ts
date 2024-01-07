import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { queryClient } from '@/lib/queryClient/queryClient';

type CreateGuildBanMutationArgs = {
    userId: string;
    guildId: string;
    reason: string;
};

const createGuildBanRequest = ({ guildId, reason, userId }: CreateGuildBanMutationArgs) => {
    return api.post(`/v1/guilds/${guildId}/bans`, { userId, reason });
};

export const useCreateGuildBanMutation = () => {
    return useMutation({
        mutationFn: createGuildBanRequest,
        onSuccess: (_, args) => {
            queryClient.invalidateQueries({ queryKey: [args.guildId, 'bans'] });
        },
    });
};
