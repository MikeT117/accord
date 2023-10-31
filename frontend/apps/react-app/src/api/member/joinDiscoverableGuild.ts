import { AccordApiErrorResponse, Guild } from '@accord/common';
import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/axios';

export const useJoinDiscoverableGuildMutation = () => {
  const navigate = useNavigate();
  return useMutation<Record<string, never>, AxiosError<AccordApiErrorResponse>, Pick<Guild, 'id'>>({
    mutationFn: async ({ id }) => {
      return api.post(`/v1/guilds/${id}/join`);
    },
    onError: (error, { id }) => {
      if (error.response?.data.message === 'ALREADY_A_MEMBER') {
        navigate(`/app/server/${id}`);
      }
    },
  });
};
