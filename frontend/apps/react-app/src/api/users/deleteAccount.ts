import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { sessionStore } from '@/shared-stores/sessionStore';

const deleteAccountRequest = async () => api.delete('/v1/users/@me');

export const useDeleteAccountMutation = () => {
    return useMutation({
        mutationFn: deleteAccountRequest,
        onSuccess: () => sessionStore.clearSession(),
    });
};
