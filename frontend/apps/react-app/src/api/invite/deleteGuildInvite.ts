import { AccordApiErrorResponse, GuildInvite } from '@accord/common';
import { AxiosError } from 'axios';
import { InfiniteData, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { queryClient } from '@/lib/queryClient/queryClient';
import { deleteInfiniteDataItem } from '../../lib/queryClient/utils/deleteInfiniteDataItem';

export const useDeleteGuildInviteMutation = () => {
  return useMutation<
    Pick<GuildInvite, 'id'>,
    AxiosError<AccordApiErrorResponse>,
    { inviteId: string; guildId: string }
  >(
    async ({ inviteId, guildId }) => {
      const { data } = await api.delete(`/v1/guilds/${guildId}/invites/${inviteId}`);
      return data.invite;
    },
    {
      onSuccess: (_, { inviteId, guildId }) => {
        queryClient.setQueryData<InfiniteData<GuildInvite[]>>([guildId, 'invites'], (prev) =>
          deleteInfiniteDataItem(prev, (m) => m.id !== inviteId),
        );
      },
    },
  );
};
