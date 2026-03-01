import { fromUnixTime } from "date-fns";
import * as z from "zod/v4-mini";
import { guildRoleSchema } from "./guild-role";
import { guildChannelSchema } from "./channel-schema";
import { voiceStateSchema } from "./voice-state-schema";

export const guildSchema = z.object({
    id: z.string(),
    creatorId: z.string(),
    guildCategoryId: z.nullable(z.string()),
    name: z.string(),
    description: z.string(),
    discoverable: z.boolean(),
    channelCount: z.number(),
    memberCount: z.number(),
    icon: z.pipe(
        z.optional(z.nullable(z.string())),
        z.transform((a) => (!a || a.trim() === "" ? null : a)),
    ),
    banner: z.pipe(
        z.optional(z.nullable(z.string())),
        z.transform((a) => (!a || a.trim() === "" ? null : a)),
    ),
    createdAt: z.pipe(
        z.number(),
        z.transform((num) => fromUnixTime(num)),
    ),
    updatedAt: z.pipe(
        z.number(),
        z.transform((num) => fromUnixTime(num)),
    ),
    roles: z.array(guildRoleSchema),
    channels: z.array(guildChannelSchema),
    voiceStates: z.array(voiceStateSchema),
});

export const discoverableGuildSchema = z.pick(guildSchema, {
    id: true,
    creatorId: true,
    guildCategoryId: true,
    name: true,
    description: true,
    discoverable: true,
    channelCount: true,
    memberCount: true,
    icon: true,
    banner: true,
    createdAt: true,
    updatedAt: true,
});

export const discoverableGuildsSchema = z.array(discoverableGuildSchema);

export const guildUpdatedSchema = z.pick(guildSchema, {
    id: true,
    guildCategoryId: true,
    name: true,
    description: true,
    discoverable: true,
    channelCount: true,
    memberCount: true,
    updatedAt: true,
    icon: true,
    banner: true,
});

export const guildDeletedSchema = z.pick(guildSchema, {
    id: true,
});
