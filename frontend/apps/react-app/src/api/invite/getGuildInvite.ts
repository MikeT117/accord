import { GuildInvite, AccordApiErrorResponse } from '@accord/common';
import { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useGetGuildInviteQuery = ({
  inviteId,
  enabled,
}: {
  inviteId: string;
  enabled: boolean;
}) => {
  return useQuery<GuildInvite, AxiosError<AccordApiErrorResponse>>({
    queryKey: [inviteId],
    queryFn: async () => {
      const { data } = await api.get(`/v1/invites/${inviteId}`);
      return data.invite ?? null;
    },
    enabled,
    gcTime: Infinity,
    staleTime: Infinity,
    retry: 0,
  });
};
