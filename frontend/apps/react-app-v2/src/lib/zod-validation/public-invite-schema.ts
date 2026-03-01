import { fromUnixTime } from "date-fns";
import * as z from "zod/v4-mini";

export const publicInviteSchema = z.object({
    id: z.string(),
    guildId: z.string(),
    name: z.string(),
    description: z.string(),
    channelCount: z.number(),
    memberCount: z.number(),
    icon: z.nullable(z.string()),
    banner: z.nullable(z.string()),
    createdAt: z.pipe(
        z.number(),
        z.transform((num) => fromUnixTime(num)),
    ),
    expiresAt: z.pipe(
        z.number(),
        z.transform((num) => fromUnixTime(num)),
    ),
});

export const publicInvitesSchema = z.array(publicInviteSchema);
