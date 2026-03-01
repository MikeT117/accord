import { fromUnixTime } from "date-fns";
import * as z from "zod/v4-mini";

export const guildMemberSchema = z.object({
    id: z.string(),
    displayName: z.string(),
    username: z.string(),
    avatar: z.nullable(z.string()),
    banner: z.nullable(z.string()),
    guildId: z.string(),
    createdAt: z.pipe(
        z.number(),
        z.transform((num) => fromUnixTime(num)),
    ),
    updatedAt: z.pipe(
        z.number(),
        z.transform((num) => fromUnixTime(num)),
    ),
    roles: z.array(z.string()),
});

export const guildMembersSchema = z.array(guildMemberSchema);
