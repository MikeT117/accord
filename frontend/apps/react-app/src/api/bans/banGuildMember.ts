import { GuildMember, AccordApiErrorResponse } from '@accord/common';
import { AxiosError } from 'axios';
import { InfiniteData, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { queryClient } from '@/lib/queryClient/queryClient';
import { insertInfiniteDataItem } from '../../lib/queryClient/utils/insertInfiniteDataItem';
import { deleteInfiniteDataItem } from '../../lib/queryClient/utils/deleteInfiniteDataItem';

export const useBanGuildMemberMutation = () => {
  return useMutation<
    Omit<GuildMember, 'roles'>,
    AxiosError<AccordApiErrorResponse>,
    Pick<GuildMember, 'id' | 'guildId'>
  >({
    mutationFn: async ({ guildId, id }) => {
      const { data } = await api.put(`/v1/guilds/${guildId}/bans/${id}`, { banReason: '' });
      return data.guildMember;
    },

    onSuccess: (guildMember, { id, guildId }) => {
      queryClient.setQueryData<InfiniteData<Omit<GuildMember, 'roles'>[]>>(
        [guildId, 'bans'],
        (prev) => insertInfiniteDataItem(prev, guildMember),
      );
      queryClient.setQueryData<InfiniteData<Omit<GuildMember, 'roles'>[]>>(
        [guildId, 'members'],
        (prev) => deleteInfiniteDataItem(prev, (m) => m.id !== id),
      );
    },
  });
};
