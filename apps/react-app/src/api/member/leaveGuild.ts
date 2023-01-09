import { AccordApiErrorResponse, Guild } from '@accord/common';
import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/axios';
import { queryClient } from '@/lib/queryClient/queryClient';
import { guildActions } from '@/shared-stores/guildStore';
import { guildChannelActions } from '@/shared-stores/guildChannelStore';

export const useLeaveGuildMutation = () => {
  const navigate = useNavigate();
  return useMutation<Record<string, never>, AxiosError<AccordApiErrorResponse>, Pick<Guild, 'id'>>(
    async ({ id }) => {
      return api.delete(`/v1/users/@me/guilds/${id}`);
    },
    {
      onSuccess: (_, { id }) => {
        guildActions.deleteGuild(id);
        guildChannelActions.deleteChannelByGuildId(id);
        queryClient.removeQueries([id], { exact: false });
        navigate('/app');
      },
    },
  );
};
