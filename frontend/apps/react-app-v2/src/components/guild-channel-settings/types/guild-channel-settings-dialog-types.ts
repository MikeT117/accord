import * as z from "zod/v4-mini";
import {
    updateGuildChannelFormSchema,
    updateGuildCategoryChannelFormSchema,
} from "../zod-validation/guild-channel-settings-form-validation";

export type UpdateGuildChannelFormType = z.infer<typeof updateGuildChannelFormSchema>;
export type UpdateGuildCategoryChannelFormType = z.infer<typeof updateGuildCategoryChannelFormSchema>;
