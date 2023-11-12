import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { guildStore } from '@/shared-stores/guildStore';
import { z } from 'zod';

type CreateGuildChannelRequestArgs = {
  guildId: string;
  name: string;
  topic: string;
  isPrivate: boolean;
  roles?: string[];
  channelType: number;
};

const createGuildChannelMutationResponseSchema = z.object({
  id: z.string(),
  guildId: z.string(),
  name: z.string(),
  topic: z.string(),
  channelType: z.number(),
  parentId: z.string().nullable().optional(),
  creatorId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  roles: z.array(z.string()),
});

const createGuildChannelRequest = async ({ guildId, ...args }: CreateGuildChannelRequestArgs) => {
  const resp = await api.post(`/v1/guilds/${guildId}/channels`, args);
  return createGuildChannelMutationResponseSchema.parse(resp.data.data);
};

export const useCreateGuildChannelMutation = () => {
  return useMutation({
    mutationFn: createGuildChannelRequest,
    onSuccess: (channel) => {
      guildStore.createChannel(channel);
    },
  });
};
