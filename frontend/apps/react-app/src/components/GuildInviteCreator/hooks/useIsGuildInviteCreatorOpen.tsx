import { useGuildInviteCreatorStore } from '../stores/useGuildInviteCreatorStore';

export const useIsGuildInviteCreatorOpen = () => {
    return useGuildInviteCreatorStore((s) => s.isOpen);
};
