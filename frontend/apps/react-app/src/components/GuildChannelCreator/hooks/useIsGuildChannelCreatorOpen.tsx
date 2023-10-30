import { useCallback } from 'react';
import { useGuildChannelCreatorStore } from '../stores/useGuildChannelCreatorStore';

export const useIsGuildChannelCreatorOpen = () => {
  return useGuildChannelCreatorStore(useCallback((s) => s.isOpen, []));
};
