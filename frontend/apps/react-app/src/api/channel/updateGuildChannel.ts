import { AccordApiErrorResponse, GuildChannel } from '@accord/common';
import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { guildStore } from '@/shared-stores/guildStore';

export const useUpdateGuildChannelMutation = () => {
  return useMutation<
    Pick<GuildChannel, 'id' | 'channelType' | 'guildId'> &
      Partial<Pick<GuildChannel, 'name' | 'topic' | 'parentId' | 'parentRoleSync'>>,
    AxiosError<AccordApiErrorResponse>,
    Pick<GuildChannel, 'id' | 'channelType' | 'guildId'> &
      Partial<Pick<GuildChannel, 'name' | 'topic' | 'parentId'>>
  >({
    mutationFn: async (payload) => {
      const { data } = await api.patch(
        `/v1/channels/${payload.id}`,
        Object.fromEntries(Object.entries(payload).filter(([_, v]) => v !== undefined)),
      );
      return data.channel;
    },
    onSuccess: ({ id, channelType, name, parentId, topic, guildId, parentRoleSync }) => {
      guildStore.updateChannel({
        id,
        channelType,
        name,
        parentId,
        topic,
        guildId,
        parentRoleSync,
      });
    },
  });
};
