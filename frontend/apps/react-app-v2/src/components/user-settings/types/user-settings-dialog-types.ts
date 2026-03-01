import * as z from "zod/v4-mini";
import { updateUserFormSchema, updateGuildProfileFormSchema } from "../zod-validation/user-settings-form-validation";

export type UpdateUserFormType = z.infer<typeof updateUserFormSchema>;
export type UpdateGuildProfileFormType = z.infer<typeof updateGuildProfileFormSchema>;
export type UserPermissionsFormType = { allowFriendRequests: boolean; allowGuildMemberDMs: boolean };
