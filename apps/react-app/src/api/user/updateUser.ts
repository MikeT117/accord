import type { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import type { AccordApiErrorResponse, Attachment, UserAccount } from '@accord/common';
import { api } from '@/lib/axios';
import { loggedInUserActions } from '@/shared-stores/loggedInUserStore';

export const useUpdateUserMutation = () => {
  return useMutation<
    Pick<UserAccount, 'displayName' | 'avatar'>,
    AxiosError<AccordApiErrorResponse>,
    Pick<UserAccount, 'displayName'> & {
      avatar?: Omit<Attachment, 'id'>;
    }
  >(
    async ({ avatar, displayName }) => {
      const { data } = await api.patch('/v1/users/@me', { displayName, avatar });
      return data.user;
    },
    {
      onSuccess: (user) => {
        loggedInUserActions.updateUser(user);
      },
    },
  );
};
