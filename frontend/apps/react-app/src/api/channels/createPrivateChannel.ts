import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { privateChannelStore } from '@/shared-stores/privateChannelStore';
import { z } from 'zod';

const createPrivateChannelResponseSchema = z.object({
    id: z.string(),
    name: z.string(),
    topic: z.string(),
    channelType: z.number(),
    creatorId: z.string(),
    updatedAt: z.coerce.date(),
    users: z.array(
        z.object({
            id: z.string(),
            avatar: z.string().nullable(),
            displayName: z.string(),
            username: z.string(),
            publicFlags: z.number(),
        }),
    ),
});

const createPrivateChannelRequest = async (recipients: string[]) => {
    const resp = await api.post('/v1/users/@me/channels', {
        recipients,
    });
    return createPrivateChannelResponseSchema.parse(resp.data.data);
};

export const useCreatePrivateChannelMutation = () => {
    return useMutation({
        mutationFn: createPrivateChannelRequest,
        onSuccess: (channel) => {
            privateChannelStore.create(channel);
        },
    });
};
