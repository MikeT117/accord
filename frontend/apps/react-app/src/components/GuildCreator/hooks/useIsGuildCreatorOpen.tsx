import { useCallback } from 'react';
import { useGuildCreatorStore } from '../stores/useGuildCreatorStore';

export const useIsGuildCreatorOpen = () => {
  return useGuildCreatorStore(useCallback((s) => s.isOpen, []));
};
