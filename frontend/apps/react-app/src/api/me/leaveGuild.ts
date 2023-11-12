import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/axios';
import { queryClient } from '@/lib/queryClient/queryClient';
import { guildStore } from '@/shared-stores/guildStore';

const leaveGuildRequest = async (id: string) => {
  return api.delete(`/v1/users/@me/guilds/${id}`);
};

export const useLeaveGuildMutation = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: leaveGuildRequest,
    onSuccess: (_, id) => {
      guildStore.deleteGuild(id);
      queryClient.removeQueries({ queryKey: [id], exact: false });
      navigate('/app');
    },
  });
};
