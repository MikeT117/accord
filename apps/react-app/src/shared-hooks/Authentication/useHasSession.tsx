import { useCallback } from 'react';
import { useSessionStore } from '@/shared-stores/sessionStore';

export const useHasSession = () =>
  useSessionStore(useCallback((s) => !!(s.accesstoken && s.refreshtoken), []));
