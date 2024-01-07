import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { guildStore } from '@/shared-stores/guildStore';
import { z } from 'zod';

type UpdateGuildMutationArgs = {
    id: string;
    name: string;
    description: string;
    isDiscoverable: boolean;
    icon?: string;
    banner?: string;
    categoryId?: string | null;
};

const updateGuildResponseSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    isDiscoverable: z.boolean(),
    icon: z.string().nullable(),
    banner: z.string().nullable(),
    guildCategoryId: z.string().nullable(),
});

const updateGuildRequest = async ({ id, ...args }: UpdateGuildMutationArgs) => {
    const resp = await api.patch(`/v1/guilds/${id}`, args);
    return updateGuildResponseSchema.parse(resp.data.data);
};

export const useUpdateGuildMutation = () => {
    return useMutation({
        mutationFn: updateGuildRequest,
        onSuccess: (guild) => guildStore.updateGuild(guild),
    });
};
