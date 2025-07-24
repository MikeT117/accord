import { fromUnixTime } from "date-fns";
import * as z from "zod/v4-mini";

export const guildRoleSchema = z.object({
    id: z.string(),
    guildId: z.string(),
    name: z.string(),
    permissions: z.number(),
    createdAt: z.pipe(
        z.number(),
        z.transform((num) => fromUnixTime(num))
    ),
    updatedAt: z.pipe(
        z.number(),
        z.transform((num) => fromUnixTime(num))
    ),
});

export const guildRoleUpdatedSchema = z.pick(guildRoleSchema, {
    id: true,
    guildId: true,
    name: true,
    permissions: true,
    updatedAt: true,
});

export const guildRoleDeletedSchema = z.pick(guildRoleSchema, {
    id: true,
    guildId: true,
});
