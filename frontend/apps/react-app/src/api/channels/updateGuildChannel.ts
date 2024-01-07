import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

type UpdateGuildChannelRequestArgs = {
    channelId: string;
    guildId: string;
    parentId?: string | null;
    lockPermissions: boolean;
};

const updateGuildChannelRequest = async ({
    channelId,
    guildId,
    lockPermissions,
    parentId,
}: UpdateGuildChannelRequestArgs) => {
    return api.patch(`/v1/guilds/${guildId}/channels/${channelId}`, { lockPermissions, parentId });
};

export const useUpdateGuildChannelMutation = () => {
    return useMutation({
        mutationFn: updateGuildChannelRequest,
    });
};
