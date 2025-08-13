import * as z from "zod/v4-mini";
import type {
    assignRoleMembersSchema,
    updateGuildFormSchema,
    updateGuildRoleFormSchema,
} from "./guild-settings-form-validation";

export type UpdateGuildRoleFormType = z.infer<typeof updateGuildRoleFormSchema>;
export type UpdateGuildFormType = z.infer<typeof updateGuildFormSchema>;
export type AssignRoleMemberFormType = z.infer<typeof assignRoleMembersSchema>;
