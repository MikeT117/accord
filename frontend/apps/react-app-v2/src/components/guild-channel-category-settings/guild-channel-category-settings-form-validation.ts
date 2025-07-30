import * as z from "zod/v4-mini";

export const updateGuildCategoryChannelFormSchema = z.object({
    name: z.string().check(z.minLength(3)),
});
