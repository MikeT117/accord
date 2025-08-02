import * as z from "zod/v4-mini";

export const updateUserFormSchema = z.object({
    displayName: z.string().check(z.minLength(3)),
    publicFlags: z.number(),
});
