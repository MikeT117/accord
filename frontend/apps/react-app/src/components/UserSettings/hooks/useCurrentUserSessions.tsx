import { useDeleteUserSessionMutation } from '../../../api/users/deleteUserSession';
import { useGetUserSessionsQuery } from '../../../api/users/getUserSessions';

export const useCurrentUserSessions = () => {
  const { data, fetchNextPage, hasNextPage } = useGetUserSessionsQuery();
  const { mutate } = useDeleteUserSessionMutation();
  const deleteSession = (id: string) => mutate(id);
  return { data, fetchNextPage, hasNextPage, deleteSession };
};
