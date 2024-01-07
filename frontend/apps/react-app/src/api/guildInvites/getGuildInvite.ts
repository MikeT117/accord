import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { z } from 'zod';

const getGuildInviteResponseSchema = z.object({
    id: z.string(),
    name: z.string(),
    flags: z.number(),
    description: z.string(),
    memberCount: z.number(),
    guildId: z.string(),
    icon: z.string().nullable(),
    banner: z.string().nullable(),
});

const getGuildInviteRequest = async (inviteId: string) => {
    const resp = await api.get(`/v1/invites/${inviteId}`);
    return getGuildInviteResponseSchema.parse(resp.data.data);
};

export const useGetGuildInviteQuery = (inviteId: string, enabled: boolean) => {
    return useQuery({
        queryKey: ['user', 'invites', inviteId],
        queryFn: () => getGuildInviteRequest(inviteId),
        enabled,
        gcTime: Infinity,
        staleTime: Infinity,
    });
};
