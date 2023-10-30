import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCreateGuildInviteMutation } from '@/api/invite/createGuildInvite';
import { env } from '@/env';
import { toastStore } from '@/shared-components/Toast';

export const useNewGuildInvite = () => {
  const { guildId = '' } = useParams();
  const { mutate, data, status, isError } = useCreateGuildInviteMutation();

  useEffect(() => {
    if (guildId && status === 'idle') {
      mutate({ guildId });
    }
  }, [guildId, status, mutate]);

  useEffect(() => {
    if (isError) {
      toastStore.addToast({ title: 'Could not create invite', type: 'ERROR', duration: 5000 });
    }
  }, [isError]);

  return data ? `https://${env.apiUrl}/invite/${data.id}` : null;
};
