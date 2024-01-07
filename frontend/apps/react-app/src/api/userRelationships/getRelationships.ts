import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { z } from 'zod';
import { useCallback } from 'react';

const getUserRelationshipsResponseSchema = z.array(
    z.object({
        id: z.string(),
        creatorId: z.string(),
        status: z.number(),
        updatedAt: z.coerce.date(),
        user: z.object({
            id: z.string(),
            avatar: z.string().nullable(),
            displayName: z.string(),
            username: z.string(),
            publicFlags: z.number(),
        }),
    }),
);

const getUserRelationshipsRequest = async () => {
    const resp = await api.get(`/v1/users/@me/relationships`);
    return getUserRelationshipsResponseSchema.parse(resp.data.data);
};

export const useGetRelationshipsQuery = (status: number, filter: string) => {
    return useQuery({
        queryKey: ['relationships'],
        queryFn: getUserRelationshipsRequest,
        staleTime: Infinity,
        gcTime: Infinity,
        select:
            useCallback(
                (relationships: z.infer<typeof getUserRelationshipsResponseSchema>) =>
                    relationships.filter((r) => {
                        if (!filter.trim()) {
                            return r.status === status;
                        }
                        return (
                            r.status === status &&
                            r.user.displayName.toLowerCase() === filter.toLowerCase()
                        );
                    }),
                [status, filter],
            ) ?? [],
    });
};
