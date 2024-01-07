import { useMutation } from '@tanstack/react-query';
import {
    guildSettingsStore,
    GUILD_ROLE_EDITOR,
} from '@/components/GuildSettings/stores/useGuildSettingsStore';
import { api } from '@/lib/axios';
import { guildStore } from '@/shared-stores/guildStore';
import { z } from 'zod';

const createGuildRoleResponseSchema = z.object({
    id: z.string(),
    name: z.string(),
    permissions: z.number(),
    guildId: z.string(),
    creatorId: z.string(),
    updatedAt: z.coerce.date(),
});

const createGuildRoleRequest = async (guildId: string) => {
    const resp = await api.post(`/v1/guilds/${guildId}/roles`);
    return createGuildRoleResponseSchema.parse(resp.data.data);
};

export const useCreateRoleMutation = () => {
    return useMutation({
        mutationFn: createGuildRoleRequest,
        onSuccess: (role) => {
            guildStore.createRole(role);
            guildSettingsStore.setRole(role.id);
            guildSettingsStore.setSection(GUILD_ROLE_EDITOR);
        },
    });
};
