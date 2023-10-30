import { AccordApiErrorResponse, GuildChannel } from '@accord/common';
import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { guildStore } from '@/shared-stores/guildStore';

export const useCreateGuildChannelMutation = () => {
  return useMutation<
    GuildChannel,
    AxiosError<AccordApiErrorResponse>,
    {
      name: string;
      guildId: string;
      topic?: string;
      roles?: string[];
      type: 0 | 1 | 4;
      isPrivate: boolean;
    }
  >(
    async ({ guildId, ...body }) => {
      const { data } = await api.post(`/v1/guilds/${guildId}/channels`, body);
      return data.channel;
    },
    {
      onSuccess: (channel) => {
        guildStore.createChannel(channel);
      },
    },
  );
};
