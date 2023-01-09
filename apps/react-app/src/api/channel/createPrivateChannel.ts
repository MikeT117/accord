import { AccordApiErrorResponse, PrivateChannel } from '@accord/common';
import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { privateChannelActions } from '@/shared-stores/privateChannelStore';

export const useCreatePrivateChannelMutation = () => {
  return useMutation<PrivateChannel, AxiosError<AccordApiErrorResponse>, { users: string[] }>(
    async ({ users }) => {
      const { data } = await api.post('/v1/users/@me/channels', {
        users,
      });
      return data.channel;
    },
    {
      onSuccess: (channel) => {
        privateChannelActions.addChannel(channel);
      },
    },
  );
};
