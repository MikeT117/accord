import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { z } from 'zod';
import { queryClient } from '../../lib/queryClient/queryClient';

const createGuildInviteResponseSchema = z.string();

const createGuildInviteRequest = async (guildId: string) => {
    const resp = await api.post(`/v1/guilds/${guildId}/invites`);
    return createGuildInviteResponseSchema.parse(resp.data.data);
};

export const useCreateGuildInviteMutation = () => {
    return useMutation({
        mutationFn: createGuildInviteRequest,
        onSuccess(_, guildId) {
            queryClient.invalidateQueries({ queryKey: [guildId, 'invites'] });
        },
    });
};
