import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/axios';
import { guildStore } from '@/shared-stores/guildStore';

const deleteGuildRequest = async (id: string) => {
  return api.delete(`/v1/guilds/${id}`);
};

export const useDeleteGuildMutation = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: deleteGuildRequest,
    onSuccess: (_, id) => {
      navigate('/app');
      guildStore.deleteGuild(id);
    },
  });
};
