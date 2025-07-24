import { fromUnixTime } from "date-fns";
import * as z from "zod/v4-mini";

export const guildMemberSchema = z.object({
    guildId: z.string(),
    nickname: z.string(),
    createdAt: z.pipe(
        z.number(),
        z.transform((num) => fromUnixTime(num))
    ),
    updatedAt: z.pipe(
        z.number(),
        z.transform((num) => fromUnixTime(num))
    ),
    avatar: z.nullable(z.string()),
    banner: z.nullable(z.string()),
    roles: z.array(z.string()),
});
