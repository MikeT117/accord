import * as z from "zod/v4-mini";
import { createGuildCategoryFormSchema } from "../zod-validation/guild-category-creator-form-validation";

export type CreateGuildCategoryFormType = z.infer<typeof createGuildCategoryFormSchema>;
