import { useCallback } from 'react';
import { useGuildStore } from '@/shared-stores/guildStore';

export const useIsGuildMember = (id: string) => {
  return useGuildStore(useCallback((s) => s.ids.some((i) => i === id), [id]));
};
