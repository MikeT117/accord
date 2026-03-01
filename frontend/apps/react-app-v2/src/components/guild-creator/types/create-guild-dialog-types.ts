import * as z from "zod/v4-mini";
import { createGuildFormSchema } from "../zod-validation/guild-creator-form-validation";

export type CreateGuildFormType = z.infer<typeof createGuildFormSchema>;
