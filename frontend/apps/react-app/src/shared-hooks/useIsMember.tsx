import { useGuildStore } from '@/shared-stores/guildStore';

export const useIsGuildMember = (id?: string | null) => {
    return useGuildStore((s) => (id ? s.ids.some((i) => i === id) : false));
};
