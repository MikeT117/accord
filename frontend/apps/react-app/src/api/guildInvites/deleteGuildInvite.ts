import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { queryClient } from '@/lib/queryClient/queryClient';

type DeleteGuildInviteRequestArgs = {
    inviteId: string;
    guildId: string;
};

const deleteGuildInviteRequest = async ({ inviteId, guildId }: DeleteGuildInviteRequestArgs) => {
    return api.delete(`/v1/guilds/${guildId}/invites/${inviteId}`);
};

export const useDeleteGuildInviteMutation = () => {
    return useMutation({
        mutationFn: deleteGuildInviteRequest,
        onSuccess: (_, args) => {
            queryClient.invalidateQueries({ queryKey: [args.guildId, 'invites'] });
        },
    });
};
