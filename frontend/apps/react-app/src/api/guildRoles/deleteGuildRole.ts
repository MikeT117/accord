import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { guildStore } from '@/shared-stores/guildStore';

type DeleteGuildRoleRequestArgs = {
    id: string;
    guildId: string;
};

const deleteGuildRoleRequest = async ({ id, guildId }: DeleteGuildRoleRequestArgs) => {
    return api.delete(`/v1/guilds/${guildId}/roles/${id}`);
};

export const useDeleteRoleMutation = () => {
    return useMutation({
        mutationFn: deleteGuildRoleRequest,
        onSuccess: (_, { id, guildId }) => {
            guildStore.deleteRole(id, guildId);
        },
    });
};
