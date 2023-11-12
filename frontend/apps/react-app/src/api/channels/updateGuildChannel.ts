import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

type UpdateGuildChannelRequestArgs = {
  channelId: string;
  guildId: string;
  parentId?: string | null;
  sync: boolean;
};

const updateGuildChannelRequest = async ({
  channelId,
  guildId,
  sync,
  parentId,
}: UpdateGuildChannelRequestArgs) => {
  return api.patch(`/v1/guilds/${guildId}/channels/${channelId}`, { sync, parentId });
};

export const useUpdateGuildChannelMutation = () => {
  return useMutation({
    mutationFn: updateGuildChannelRequest,
  });
};
