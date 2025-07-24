import * as z from "zod/v4-mini";
import type { createGuildCategoryFormSchema } from "./guild-category-creator-form-validation";

export type CreateGuildCategoryFormType = z.infer<typeof createGuildCategoryFormSchema>;
