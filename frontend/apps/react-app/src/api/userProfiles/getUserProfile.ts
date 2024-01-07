import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { z } from 'zod';

const getUserProfileSchema = z.object({
    id: z.string(),
    avatar: z.string().nullable(),
    displayName: z.string(),
    username: z.string(),
    publicFlags: z.number(),
    mutualGuilds: z.array(z.string()),
    guildMember: z
        .object({
            joinedAt: z.coerce.date(),
            roles: z.array(z.string()),
        })
        .optional(),
});

const getUserProfileRequestInfo = async (userId: string, guildId?: string | null) => {
    const resp = await api.get(
        `/v1/users/${userId}/profile${!!guildId ? '?guild_id=' + guildId : ''}`,
    );
    return getUserProfileSchema.parse(resp.data.data);
};

export const useGetUserProfileQuery = (userId: string, guildId?: string | null) => {
    return useQuery({
        queryKey: ['user', userId, 'profile', guildId],
        queryFn: () => getUserProfileRequestInfo(userId, guildId),
        staleTime: 10000,
        gcTime: 10000,
    });
};
