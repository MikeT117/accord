import { AccordApiErrorResponse, Attachment, Guild } from '@accord/common';
import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useCreateGuildMutation = () => {
  return useMutation<
    undefined,
    AxiosError<AccordApiErrorResponse>,
    Pick<Guild, 'isDiscoverable' | 'name' | 'guildCategoryId'> & { icon?: Omit<Attachment, 'id'> }
  >(async (guild) => api.post('/v1/guilds', guild));
};
