import { fromUnixTime } from "date-fns";
import * as z from "zod/v4-mini";
import { userSchema } from "./user-schema";
import { attachmentSchema } from "./attachment-schema";

export const channelMessageSchema = z.object({
    id: z.string(),
    content: z.string(),
    pinned: z.boolean(),
    flag: z.number(),
    channelId: z.string(),
    createdAt: z.pipe(
        z.number(),
        z.transform((num) => fromUnixTime(num))
    ),
    updatedAt: z.pipe(
        z.number(),
        z.transform((num) => fromUnixTime(num))
    ),
    author: userSchema,
    attachments: z.array(attachmentSchema),
});

export const channelMessagesSchema = z.array(channelMessageSchema);

export const channelMessageUpdatedSchema = z.pick(channelMessageSchema, {
    id: true,
    content: true,
    pinned: true,
    flag: true,
    channelId: true,
    updatedAt: true,
    attachments: true,
});

export const channelMessageDeletedSchema = z.pick(channelMessageSchema, {
    id: true,
    channelId: true,
});
