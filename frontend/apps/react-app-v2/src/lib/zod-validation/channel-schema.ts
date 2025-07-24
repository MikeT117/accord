import { fromUnixTime } from "date-fns";
import * as z from "zod/v4-mini";
import { userSchema } from "./user-schema";

export const GUILD_CHANNEL_TYPE = {
    GUILD_TEXT_CHANNEL: 0,
    GUILD_VOICE_CHANNEL: 1,
    GUILD_CATEGORY_CHANNEL: 2,
} as const;

export const PRIVATE_CHANNEL_TYPE = {
    PRIVATE_DIRECT_CHANNEL: 3,
    PRIVATE_GROUP_CHANNEL: 4,
} as const;

const guildChannelType = z.literal([
    GUILD_CHANNEL_TYPE.GUILD_TEXT_CHANNEL,
    GUILD_CHANNEL_TYPE.GUILD_VOICE_CHANNEL,
    GUILD_CHANNEL_TYPE.GUILD_CATEGORY_CHANNEL,
]);

const privateChannelType = z.literal([
    PRIVATE_CHANNEL_TYPE.PRIVATE_DIRECT_CHANNEL,
    PRIVATE_CHANNEL_TYPE.PRIVATE_GROUP_CHANNEL,
]);

const baseChannelSchema = z.object({
    id: z.string(),
    creatorId: z.string(),
    topic: z.string(),
    createdAt: z.pipe(
        z.number(),
        z.transform((num) => fromUnixTime(num))
    ),
    updatedAt: z.pipe(
        z.number(),
        z.transform((num) => fromUnixTime(num))
    ),
});

const baseGuildChannelSchema = z.extend(baseChannelSchema, {
    channelType: guildChannelType,
    guildId: z.string(),
    name: z.string(),
    roleIds: z.array(z.string()).check(z.minLength(1)),
});

const basePrivateChannelSchema = z.extend(baseChannelSchema, {
    channelType: privateChannelType,
    users: z.array(userSchema).check(z.minLength(2)),
});

export const guildChannelSchema = z.discriminatedUnion("channelType", [
    z.extend(baseGuildChannelSchema, {
        channelType: z.literal(GUILD_CHANNEL_TYPE.GUILD_TEXT_CHANNEL),
        guildId: z.string(),
        parentId: z.nullable(z.string()),
        name: z.string(),
        roleIds: z.array(z.string()).check(z.minLength(1)),
    }),
    z.extend(baseGuildChannelSchema, {
        channelType: z.literal(GUILD_CHANNEL_TYPE.GUILD_VOICE_CHANNEL),
        guildId: z.string(),
        parentId: z.nullable(z.string()),
        name: z.string(),
        roleIds: z.array(z.string()).check(z.minLength(1)),
    }),
    z.extend(baseGuildChannelSchema, {
        channelType: z.literal(GUILD_CHANNEL_TYPE.GUILD_CATEGORY_CHANNEL),
        guildId: z.string(),
        name: z.string(),
        roleIds: z.array(z.string()).check(z.minLength(1)),
    }),
]);

export const privateChannelSchema = z.discriminatedUnion("channelType", [
    z.extend(basePrivateChannelSchema, {
        channelType: z.literal(PRIVATE_CHANNEL_TYPE.PRIVATE_DIRECT_CHANNEL),
        users: z.array(userSchema).check(z.minLength(2)),
    }),
    z.extend(basePrivateChannelSchema, {
        channelType: z.literal(PRIVATE_CHANNEL_TYPE.PRIVATE_GROUP_CHANNEL),
        users: z.array(userSchema).check(z.minLength(2)),
    }),
]);

export const channelSchema = z.discriminatedUnion("channelType", [guildChannelSchema, privateChannelSchema]);

export const channelUpdatedSchema = z.object({
    id: z.string(),
    guildId: z.string(),
    parentId: z.nullable(z.string()),
    name: z.string(),
    topic: z.string(),
    updatedAt: z.pipe(
        z.number(),
        z.transform((num) => fromUnixTime(num))
    ),
});

export const channelDeletedSchema = z.object({
    id: z.string(),
    guildId: z.string(),
});

export const channelRoleAssociationChangeSchema = z.object({
    id: z.string(),
    guildId: z.string(),
    roleId: z.string(),
});
