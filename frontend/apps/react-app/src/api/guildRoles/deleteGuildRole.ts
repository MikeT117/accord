import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { guildStore } from '@/shared-stores/guildStore';

type DeleteGuildRoleRequestArgs = {
  roleId: string;
  guildId: string;
};

const deleteGuildRoleRequest = async ({ roleId, guildId }: DeleteGuildRoleRequestArgs) => {
  return api.delete(`/v1/guilds/${guildId}/roles/${roleId}`);
};

export const useDeleteRoleMutation = () => {
  return useMutation({
    mutationFn: deleteGuildRoleRequest,
    onSuccess: (_, { roleId, guildId }) => {
      guildStore.deleteRole(roleId, guildId);
    },
  });
};
