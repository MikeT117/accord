import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

type AssignRoleToChannelRequestArgs = {
    channelId: string;
    guildId: string;
    roleId: string;
};

const assignRoleToChannelRequest = async ({
    channelId,
    guildId,
    roleId,
}: AssignRoleToChannelRequestArgs) => {
    return api.put(`/v1/guilds/${guildId}/roles/${roleId}/channels/${channelId}`);
};

export const useAssignRoleToGuildChannelMutation = () => {
    return useMutation({
        mutationFn: assignRoleToChannelRequest,
    });
};
