import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

type UnassignRoleToChannelRequestArgs = {
  channelId: string;
  guildId: string;
  roleId: string;
};

const unassignRoleToChannelRequest = async ({
  channelId,
  guildId,
  roleId,
}: UnassignRoleToChannelRequestArgs) => {
  return api.delete(`/v1/guilds/${guildId}/roles/${roleId}/channels/${channelId}`);
};

export const useUnassignRoleFromGuildChannelMutation = () => {
  return useMutation({
    mutationFn: unassignRoleToChannelRequest,
  });
};
