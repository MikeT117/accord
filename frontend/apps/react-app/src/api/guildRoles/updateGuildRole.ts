import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { guildStore } from '@/shared-stores/guildStore';
import { z } from 'zod';

type UpdateGuildRoleRequestArgs = {
    id: string;
    guildId: string;
    name: string;
    permissions: number;
};

const updateGuildRoleResponseSchema = z.object({
    id: z.string(),
    name: z.string(),
    permissions: z.number(),
    guildId: z.string(),
    creatorId: z.string(),
    updatedAt: z.coerce.date(),
});

const updateGuildRoleRequest = async ({ guildId, id, ...body }: UpdateGuildRoleRequestArgs) => {
    const resp = await api.patch(`/v1/guilds/${guildId}/roles/${id}`, body);
    return updateGuildRoleResponseSchema.parse(resp.data.data);
};

export const useUpdateRoleMutation = () => {
    return useMutation({
        mutationFn: updateGuildRoleRequest,
        onSuccess: (role) => guildStore.updateRole(role),
    });
};
