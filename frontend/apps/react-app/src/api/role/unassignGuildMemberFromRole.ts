import { AccordApiErrorResponse, GuildMember } from '@accord/common';
import { AxiosError } from 'axios';
import { useMutation, InfiniteData } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { queryClient } from '@/lib/queryClient/queryClient';
import { deleteInfiniteDataItem } from '../../lib/queryClient/utils/deleteInfiniteDataItem';

export const useUnassignGuildMemberFromRoleMutation = () => {
  return useMutation<
    Record<string, never>,
    AxiosError<AccordApiErrorResponse>,
    { roleId: string; guildId: string; memberId: string }
  >(
    async ({ guildId, memberId, roleId }) => {
      return api.delete(`/v1/guilds/${guildId}/roles/${roleId}/members/${memberId}`);
    },
    {
      onSuccess: (_, { guildId, memberId, roleId }) => {
        queryClient.setQueryData<InfiniteData<GuildMember[]>>(
          [guildId, 'roles', roleId, 'members', 'assigned', 'true'],
          (prev) => deleteInfiniteDataItem(prev, (m) => m.id !== memberId),
        );
      },
    },
  );
};
