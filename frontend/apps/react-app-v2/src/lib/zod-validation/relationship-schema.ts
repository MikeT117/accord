import * as z from "zod/v4-mini";
import { userSchema } from "./user-schema";
import { fromUnixTime } from "date-fns";

export const RELATIONSHIP_STATUS = {
    PENDING: 0,
    FRIEND: 1,
    BLOCKED: 2,
} as const;

export const relationshipSchema = z.object({
    id: z.string(),
    creatorId: z.string(),
    recipientId: z.string(),
    status: z.literal([
        RELATIONSHIP_STATUS.PENDING,
        RELATIONSHIP_STATUS.FRIEND,
        RELATIONSHIP_STATUS.BLOCKED,
    ]),
    createdAt: z.pipe(
        z.number(),
        z.transform((num) => fromUnixTime(num))
    ),
    updatedAt: z.pipe(
        z.number(),
        z.transform((num) => fromUnixTime(num))
    ),
    user: userSchema,
});

export const relationshipsSchema = z.array(relationshipSchema);

export const relationshipUpdatedSchema = z.pick(relationshipSchema, {
    id: true,
    status: true,
    updatedAt: true,
});

export const relationshipDeletedSchema = z.pick(relationshipSchema, {
    id: true,
});
