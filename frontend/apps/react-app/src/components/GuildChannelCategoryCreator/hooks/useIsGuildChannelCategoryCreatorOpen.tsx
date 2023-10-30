import { useCallback } from 'react';
import { useGuildChannelCategoryCreatorStore } from '../stores/useGuildChannelCategoryCreatorStore';

export const useIsGuildChannelCreatorOpen = () => {
  return useGuildChannelCategoryCreatorStore(useCallback((s) => s.isOpen, []));
};
