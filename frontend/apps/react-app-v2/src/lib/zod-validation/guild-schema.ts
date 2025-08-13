import { fromUnixTime } from "date-fns";
import * as z from "zod/v4-mini";
import { guildRoleSchema } from "./guild-role";
import { guildChannelSchema } from "./channel-schema";

export const guildSchema = z.object({
    id: z.string(),
    creatorId: z.string(),
    guildCategoryId: z.string(),
    name: z.string(),
    description: z.string(),
    discoverable: z.boolean(),
    channelCount: z.number(),
    memberCount: z.number(),
    icon: z.pipe(
        z.optional(z.nullable(z.string())),
        z.transform((a) => (!a || a.trim() === "" ? null : a))
    ),
    banner: z.pipe(
        z.optional(z.nullable(z.string())),
        z.transform((a) => (!a || a.trim() === "" ? null : a))
    ),
    createdAt: z.pipe(
        z.number(),
        z.transform((num) => fromUnixTime(num))
    ),
    updatedAt: z.pipe(
        z.number(),
        z.transform((num) => fromUnixTime(num))
    ),
    roles: z.array(guildRoleSchema),
    channels: z.array(guildChannelSchema),
});

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
