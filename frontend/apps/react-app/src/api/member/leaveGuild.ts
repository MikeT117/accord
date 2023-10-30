import { AccordApiErrorResponse, Guild } from '@accord/common';
import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/axios';
import { queryClient } from '@/lib/queryClient/queryClient';
import { guildStore } from '@/shared-stores/guildStore';

export const useLeaveGuildMutation = () => {
  const navigate = useNavigate();
  return useMutation<Record<string, never>, AxiosError<AccordApiErrorResponse>, Pick<Guild, 'id'>>(
    async ({ id }) => {
      return api.delete(`/v1/users/@me/guilds/${id}`);
    },
    {
      onSuccess: (_, { id }) => {
        guildStore.deleteGuild(id);
        queryClient.removeQueries([id], { exact: false });
        navigate('/app');
      },
    },
  );
};
