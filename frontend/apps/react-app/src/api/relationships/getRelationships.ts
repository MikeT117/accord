import { UserRelationship, AccordApiErrorResponse } from '@accord/common';
import { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useGetRelationshipsQuery = () => {
  return useQuery<UserRelationship[], AxiosError<AccordApiErrorResponse>>({
    queryKey: ['relationships'],
    queryFn: async () => (await api.get(`/v1/users/@me/relationships`)).data,
    staleTime: Infinity,
    gcTime: Infinity,
  });
};
