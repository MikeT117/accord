import * as z from "zod/v4-mini";
import { userSchema } from "./user-schema";

export const voiceStateSchema = z.object({
    id: z.string(),
    guildId: z.string(),
    channelId: z.string(),
    selfMute: z.boolean(),
    selfDeaf: z.boolean(),
    user: userSchema,
});

export const voiceStateUpdatedSchema = z.object({
    id: z.string(),
    guildId: z.string(),
    channelId: z.string(),
    selfMute: z.boolean(),
    selfDeaf: z.boolean(),
});

export const voiceStateDeletedSchema = z.object({
    id: z.string(),
    guildId: z.string(),
    channelId: z.string(),
});
