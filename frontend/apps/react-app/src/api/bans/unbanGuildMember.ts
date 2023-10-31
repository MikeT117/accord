import { AccordApiErrorResponse, GuildMember } from '@accord/common';
import { AxiosError } from 'axios';
import { InfiniteData, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { queryClient } from '@/lib/queryClient/queryClient';
import { insertInfiniteDataItem } from '../../lib/queryClient/utils/insertInfiniteDataItem';
import { deleteInfiniteDataItem } from '../../lib/queryClient/utils/deleteInfiniteDataItem';

export const useUnbanGuildMemberMutation = () => {
  return useMutation<
    GuildMember,
    AxiosError<AccordApiErrorResponse>,
    Pick<GuildMember, 'id' | 'guildId'>
  >({
    mutationFn: async ({ id, guildId }) => {
      const { data } = await api.delete(`/v1/guilds/${guildId}/bans/${id}`);
      return data.guildMember;
    },

    onSuccess: (guildMember, { id, guildId }) => {
      queryClient.setQueryData<InfiniteData<GuildMember[]>>([guildId, 'members'], (prev) =>
        insertInfiniteDataItem(prev, guildMember),
      );
      queryClient.setQueryData<InfiniteData<GuildMember[]>>([guildId, 'bans'], (prev) =>
        deleteInfiniteDataItem(prev, (m) => m.id !== id),
      );
    },
  });
};
