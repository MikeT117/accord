import { AccordApiErrorResponse, GuildMember } from '@accord/common';
import { AxiosError } from 'axios';
import { useMutation, InfiniteData } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { queryClient } from '@/lib/queryClient/queryClient';
import { insertInfiniteDataItem } from '../../lib/queryClient/utils/insertInfiniteDataItem';

export const useAssignGuildMemberToRoleMutation = () => {
  return useMutation<
    Record<string, never>,
    AxiosError<AccordApiErrorResponse>,
    { roleId: string; guildId: string; members: Omit<GuildMember, 'roles'>[] }
  >(
    async ({ guildId, members, roleId }) => {
      return api.post(`/v1/guilds/${guildId}/roles/${roleId}/members`, {
        memberIds: members.map((m) => m.id),
      });
    },
    {
      onSuccess: (_, { guildId, members, roleId }) => {
        queryClient.setQueryData<InfiniteData<Omit<GuildMember, 'roles'>[]>>(
          [guildId, 'roles', roleId, 'members', 'assigned', 'true'],
          (prev) => insertInfiniteDataItem(prev, members),
        );
        queryClient.invalidateQueries([guildId, 'members']);
      },
    },
  );
};
