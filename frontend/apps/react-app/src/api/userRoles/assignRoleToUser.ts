import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { queryClient } from '@/lib/queryClient/queryClient';

type AssignRoleToUserRequestArgs = {
  guildId: string;
  userIds: string[];
  roleId: string;
};

const assignRoleToUserRequest = async ({
  guildId,
  userIds,
  roleId,
}: AssignRoleToUserRequestArgs) => {
  return api.post(`/v1/guilds/${guildId}/roles/${roleId}/members`, { userIds });
};

export const useAssignRoleToUserMutation = () => {
  return useMutation({
    mutationFn: assignRoleToUserRequest,
    onSuccess: (_, { guildId, roleId }) => {
      queryClient.invalidateQueries({ queryKey: [guildId, 'roles', roleId], exact: false });
    },
  });
};
