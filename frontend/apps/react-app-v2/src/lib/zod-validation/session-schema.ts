import * as z from "zod/v4-mini";
import { fromUnixTime } from "date-fns";

export const sessionSchema = z.object({
    id: z.string(),
    userId: z.string(),
    token: z.string(),
    ipAddress: z.string(),
    userAgent: z.string(),
    createdAt: z.pipe(
        z.number(),
        z.transform((num) => fromUnixTime(num))
    ),
    updatedAt: z.pipe(
        z.number(),
        z.transform((num) => fromUnixTime(num))
    ),
});

export const sessionsSchema = z.array(sessionSchema);
