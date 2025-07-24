import { fromUnixTime } from "date-fns";
import * as z from "zod/v4-mini";

export const attachmentSchema = z.object({
    id: z.string(),
    filename: z.string(),
    resourceType: z.string(),
    ownerId: z.string(),
    height: z.optional(z.nullable(z.number())),
    width: z.optional(z.nullable(z.number())),
    filesize: z.number(),
    createdAt: z.pipe(
        z.number(),
        z.transform((num) => fromUnixTime(num))
    ),
    updatedAt: z.pipe(
        z.number(),
        z.transform((num) => fromUnixTime(num))
    ),
    status: z.literal([0, 1]),
});
