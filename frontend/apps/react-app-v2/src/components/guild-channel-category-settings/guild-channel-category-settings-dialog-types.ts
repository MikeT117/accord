import * as z from "zod/v4-mini";
import type { updateGuildCategoryChannelFormSchema } from "./guild-channel-category-settings-form-validation";

export type UpdateGuildCategoryChannelFormType = z.infer<typeof updateGuildCategoryChannelFormSchema>;
