import * as z from "zod/v4-mini";
import type { updateUserFormSchema } from "./user-settings-form-validation";

export type UpdateUserFormType = z.infer<typeof updateUserFormSchema>;
