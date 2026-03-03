import * as z from "zod/v4-mini";
import { createGuildChannelFormSchema } from "../zod-validation/guild-channel-creator-form-validation";

export type CreateGuildChannelFormType = z.infer<typeof createGuildChannelFormSchema>;
