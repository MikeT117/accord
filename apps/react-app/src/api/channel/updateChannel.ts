import { AccordApiErrorResponse, Channel } from '@accord/common';
import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { guildChannelActions } from '@/shared-stores/guildChannelStore';
import { privateChannelActions } from '@/shared-stores/privateChannelStore';

export const useUpdateChannelMutation = () => {
  return useMutation<
    Pick<Channel, 'id' | 'type'> &
      Partial<Pick<Channel, 'guildId' | 'name' | 'topic' | 'parentId' | 'parentRoleSync'>>,
    AxiosError<AccordApiErrorResponse>,
    Pick<Channel, 'id' | 'type'> & Partial<Pick<Channel, 'guildId' | 'name' | 'topic' | 'parentId'>>
  >(
    async (payload) => {
      const { data } = await api.patch(
        `/v1/channels/${payload.id}`,
        Object.fromEntries(Object.entries(payload).filter(([_, v]) => v !== undefined)),
      );
      return data.channel;
    },
    {
      onSuccess: ({ id, type, name, parentId, topic, guildId, parentRoleSync }) => {
        if ((type === 0 || type === 1 || type === 4) && guildId) {
          guildChannelActions.updateChannel({
            id,
            type,
            name,
            parentId,
            topic,
            guildId,
            parentRoleSync,
          });
        } else if (type === 2 || type === 3) {
          privateChannelActions.updateChannel({ id, type, name });
        }
      },
    },
  );
};
