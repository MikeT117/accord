import { useCallback } from 'react';
import { useLoggedInUserStore } from '@/shared-stores/loggedInUserStore';

export const useLoggedInUser = () => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const id = useLoggedInUserStore(useCallback((s) => s.user!.id, []));
  const displayName = useLoggedInUserStore(useCallback((s) => s.user!.displayName, []));
  const avatar = useLoggedInUserStore(useCallback((s) => s.user?.avatar, []));
  return { id, displayName, avatar };
};
