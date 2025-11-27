import * as z from "zod/v4-mini";

export const uniqueUsernameSchema = z.object({
    available: z.boolean(),
});
