import { fromUnixTime } from "date-fns";
import * as z from "zod/v4-mini";

export const guildInviteSchema = z.object({
    id: z.string(),
    createdAt: z.pipe(
        z.number(),
        z.transform((num) => fromUnixTime(num)),
    ),
    expiresAt: z.pipe(
        z.number(),
        z.transform((num) => fromUnixTime(num)),
    ),
    usedCount: z.number(),
    creatorId: z.string(),
    displayName: z.string(),
    username: z.string(),
    avatar: z.pipe(
        z.optional(z.nullable(z.string())),
        z.transform((a) => (!a || a.trim() === "" ? null : a)),
    ),
});

export const guildInvitesSchema = z.array(guildInviteSchema);
