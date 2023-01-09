import { Guild, AccordApiErrorResponse, Attachment } from '@accord/common';
import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { guildActions } from '@/shared-stores/guildStore';

export const useUpdateGuildMutation = () => {
  return useMutation<
    Pick<
      Guild,
      'id' | 'name' | 'description' | 'isDiscoverable' | 'guildCategoryId' | 'banner' | 'icon'
    >,
    AxiosError<AccordApiErrorResponse>,
    Pick<Guild, 'id'> &
      Pick<Guild, 'name' | 'description' | 'isDiscoverable' | 'guildCategoryId'> & {
        banner?: Omit<Attachment, 'id'>;
        icon?: Omit<Attachment, 'id'>;
      }
  >(
    async ({ id, ...updatedGuild }) => {
      const { data } = await api.patch(`/v1/guilds/${id}`, updatedGuild);
      return data.guild;
    },
    {
      onSuccess: (guild) => {
        guildActions.updateGuild(guild);
      },
    },
  );
};
