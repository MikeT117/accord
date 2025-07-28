import * as z from "zod/v4-mini";
import type { updateGuildChannelFormSchema } from "./guild-channel-settings-form-validation";

export type UpdateGuildChannelFormType = z.infer<typeof updateGuildChannelFormSchema>;
