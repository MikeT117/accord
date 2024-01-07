import { useSessionStore } from '@/shared-stores/sessionStore';

export const useHasSession = () => useSessionStore((s) => !!(s.accesstoken && s.refreshtoken));
