import * as z from "zod/v4-mini";

export const guildCategorySchema = z.object({
    id: z.string(),
    name: z.string(),
});

export const guildCategoriesSchema = z.array(guildCategorySchema);
