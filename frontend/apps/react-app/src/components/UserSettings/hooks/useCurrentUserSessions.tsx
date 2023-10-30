import { UserSession } from '@accord/common';
import { useDeleteUserSessionMutation } from '../../../api/user/deleteUserSession';
import { useGetUserSessionsQuery } from '../../../api/user/getUserSessions';

export const useCurrentUserSessions = () => {
  const { data } = useGetUserSessionsQuery();
  const { mutate } = useDeleteUserSessionMutation();

  const deleteSession = ({
    id,
    isCurrentSession,
  }: Pick<UserSession, 'id' | 'isCurrentSession'>) => {
    if (!isCurrentSession) {
      mutate({ id });
    }
  };

  return { sessions: data, deleteSession };
};
