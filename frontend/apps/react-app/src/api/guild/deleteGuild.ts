import { Guild, AccordApiErrorResponse } from '@accord/common';
import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/axios';
import { guildStore } from '@/shared-stores/guildStore';

export const useDeleteGuildMutation = () => {
  const navigate = useNavigate();
  return useMutation<
    { guild: Pick<Guild, 'id'> },
    AxiosError<AccordApiErrorResponse>,
    Pick<Guild, 'id'>
  >({
    mutationFn: async ({ id }) => {
      return api.delete(`/v1/guilds/${id}`);
    },
    onSuccess: (_, { id }) => {
      navigate('/app');
      guildStore.deleteGuild(id);
    },
  });
};
