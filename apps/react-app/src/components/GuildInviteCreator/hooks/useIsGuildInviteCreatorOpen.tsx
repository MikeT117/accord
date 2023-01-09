import { useCallback } from 'react';
import { useGuildInviteCreatorStore } from '../stores/useGuildInviteCreatorStore';

export const useIsGuildInviteCreatorOpen = () => {
  return useGuildInviteCreatorStore(useCallback((s) => s.isOpen, []));
};
