import * as z from "zod/v4-mini";

export const createGuildCategoryFormSchema = z.object({
    name: z.string().check(z.minLength(3)),
    roleIds: z.array(z.string()),
    isPrivate: z.boolean(),
});
