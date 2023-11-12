import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { queryClient } from '@/lib/queryClient/queryClient';

type UnassignRoleToUserRequestArgs = {
  guildId: string;
  userId: string;
  roleId: string;
};

const unassignRoleFromUserRequest = async ({
  guildId,
  userId,
  roleId,
}: UnassignRoleToUserRequestArgs) => {
  return api.delete(`/v1/guilds/${guildId}/roles/${roleId}/members/${userId}`);
};

export const useUnassignRoleFromUserMutation = () => {
  return useMutation({
    mutationFn: unassignRoleFromUserRequest,
    onSuccess: (_, { guildId, roleId }) => {
      queryClient.invalidateQueries({ queryKey: [guildId, 'roles', roleId], exact: false });
    },
  });
};
