import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { guildStore } from '@/shared-stores/guildStore';
import { z } from 'zod';
import { privateChannelStore } from '../../shared-stores/privateChannelStore';

type UpdateChannelRequestArgs = {
  id: string;
  name?: string;
  topic?: string;
};

const updateChannelResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  topic: z.string(),
  guildId: z.string().optional().nullable(),
});

const updateChannelRequest = async ({ id, name, topic }: UpdateChannelRequestArgs) => {
  const resp = await api.patch(`/v1/channels/${id}`, { name, topic });
  return updateChannelResponseSchema.parse(resp.data.data);
};

export const useUpdateChannelMutation = () => {
  return useMutation({
    mutationFn: updateChannelRequest,
    onSuccess: ({ id, name, topic, guildId }) => {
      if (guildId) {
        guildStore.updateChannel({ guildId, id, name, topic });
      } else {
        privateChannelStore.update({ id, name, topic });
      }
    },
  });
};
