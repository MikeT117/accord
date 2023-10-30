import { AccordApiErrorResponse } from '@accord/common';
import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useAssignGuildChannelToRoleMutation = () => {
  return useMutation<
    Record<string, never>,
    AxiosError<AccordApiErrorResponse>,
    { roleId: string; channelId: string; guildId: string }
  >(async ({ channelId, guildId, roleId }) => {
    return api.put(`/v1/guilds/${guildId}/roles/${roleId}/channels/${channelId}`);
  });
};
