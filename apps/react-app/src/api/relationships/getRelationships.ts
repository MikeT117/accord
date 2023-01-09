import { UserRelationship, AccordApiErrorResponse } from '@accord/common';
import { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useGetRelationshipsQuery = () => {
  return useQuery<UserRelationship[], AxiosError<AccordApiErrorResponse>>(
    ['relationships'],
    async () => (await api.get(`/v1/users/@me/relationships`)).data,
    {
      staleTime: Infinity,
      cacheTime: Infinity,
    },
  );
};
