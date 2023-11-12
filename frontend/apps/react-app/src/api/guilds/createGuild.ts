import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { z } from 'zod';

type CreateGuildRequestArgs = {
  name: string;
  isDiscoverable: boolean;
  guildCategoryId?: string;
  icon?: string;
};

const createGuildResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  isDiscoverable: z.boolean(),
  creatorId: z.string(),
  guildCategoryId: z.string().nullable(),
  channelCount: z.number(),
  memberCount: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  icon: z.string().nullable(),
  banner: z.string().nullable(),
  channels: z.array(z.undefined()),
  member: z.object({
    nickname: z.string().nullable(),
    guildId: z.string(),
    joinedAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    user: z.object({
      id: z.string(),
      avatar: z.string().nullable(),
      displayName: z.string(),
      username: z.string(),
      publicFlags: z.number(),
    }),
    roles: z.array(z.string()),
  }),
  roles: z.object({
    id: z.string(),
    name: z.string(),
    permissions: z.number(),
    guildId: z.string(),
    creatorId: z.string(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
  }),
});

const createGuildRequest = async (args: CreateGuildRequestArgs) => {
  const resp = await api.post('/v1/guilds', args);
  return createGuildResponseSchema.parse(resp.data.data);
};

export const useCreateGuildMutation = () => {
  return useMutation({
    mutationFn: createGuildRequest,
  });
};
