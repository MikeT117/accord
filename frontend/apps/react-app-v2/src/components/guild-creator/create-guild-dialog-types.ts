import * as z from "zod/v4-mini";
import type { createGuildFormSchema } from "./guild-creator-form-validation";

export type CreateGuildFormType = z.infer<typeof createGuildFormSchema>;
