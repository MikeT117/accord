import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { z } from 'zod';
import { useCallback } from 'react';
import { QUERY_LIMIT } from '../../constants';

const getGuildRoleMembersResponseSchema = z.array(
    z.object({
        joinedAt: z.coerce.date(),
        roles: z.array(z.string()),
        user: z.object({
            id: z.string(),
            avatar: z.string().nullable(),
            displayName: z.string(),
            username: z.string(),
            publicFlags: z.number(),
        }),
    }),
);

type GetGuildRoleMembersRequestArg = {
    guildId: string;
    roleId: string;
    assignable: boolean;
    pageParam: string;
};

const getGuildRoleMembersRequest = async ({
    pageParam,
    guildId,
    assignable,
    roleId,
}: GetGuildRoleMembersRequestArg) => {
    const before = pageParam ? `before=${pageParam}&` : '';
    const resp = await api.get(
        `/v1/guilds/${guildId}/roles/${roleId}/members?${before}limit=${QUERY_LIMIT}&assignable=${assignable}`,
    );
    return getGuildRoleMembersResponseSchema.parse(resp.data.data);
};

export const useInfiniteGuildRoleMembersQuery = (
    guildId: string,
    roleId: string,
    filter = '',
    assignable = false,
) => {
    return useInfiniteQuery({
        queryKey: [guildId, 'roles', roleId, 'members', assignable],
        initialPageParam: '',
        queryFn: ({ pageParam }) =>
            getGuildRoleMembersRequest({ pageParam, guildId, roleId, assignable }),
        getNextPageParam: (lastPage) =>
            lastPage.length < QUERY_LIMIT ? undefined : lastPage[lastPage.length - 1].user.id,
        getPreviousPageParam: (firstPage) =>
            firstPage.length < QUERY_LIMIT ? undefined : firstPage[firstPage.length - 1].user.id,
        gcTime: 10000,
        staleTime: 5000,
        select: useCallback(
            (data: InfiniteData<z.infer<typeof getGuildRoleMembersResponseSchema>>) => {
                if (!!filter || !filter.trim()) {
                    return data.pages;
                }

                return data.pages.map((p) =>
                    p.filter((gm) =>
                        gm.user.displayName.toLowerCase().includes(filter.toLowerCase()),
                    ),
                );
            },
            [],
        ),
    });
};
