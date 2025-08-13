import { fromUnixTime } from "date-fns";
import { z } from "zod/v4-mini";

export const guildBanSchema = z.object({
    username: z.string(),
    displayName: z.string(),
    avatar: z.pipe(
        z.optional(z.nullable(z.string())),
        z.transform((a) => (!a || a.trim() === "" ? null : a)),
    ),
    banner: z.pipe(
        z.optional(z.nullable(z.string())),
        z.transform((a) => (!a || a.trim() === "" ? null : a)),
    ),
    userId: z.string(),
    guildId: z.string(),
    reason: z.string(),
    createdAt: z.pipe(
        z.number(),
        z.transform((num) => fromUnixTime(num)),
    ),
    updatedAt: z.pipe(
        z.number(),
        z.transform((num) => fromUnixTime(num)),
    ),
});

export const guildBansSchema = z.array(guildBanSchema);
