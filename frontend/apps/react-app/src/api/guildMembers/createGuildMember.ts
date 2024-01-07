import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

type CreateGuildMemberRequestArgs = {
    guildId: string;
    inviteId?: string;
};

const createGuildMemberRequest = async (args: CreateGuildMemberRequestArgs) => {
    return api.post(
        args.inviteId
            ? `/v1/guilds/${args.guildId}/join?invite_id=${args.inviteId}`
            : `/v1/guilds/${args.guildId}/join`,
    );
};

export const useCreateGuildMemberMutation = () => {
    return useMutation({
        mutationFn: createGuildMemberRequest,
    });
};
