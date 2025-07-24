import * as z from "zod/v4-mini";
import type { createGuildChannelFormSchema } from "./guild-channel-creator-form-validation";

export type CreateGuildChannelFormType = z.infer<typeof createGuildChannelFormSchema>;
