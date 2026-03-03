import * as z from "zod/v4-mini";
import {
    updateGuildRoleFormSchema,
    updateGuildFormSchema,
    assignRoleMembersSchema,
} from "../zod-validation/guild-settings-form-validation";

export type UpdateGuildRoleFormType = z.infer<typeof updateGuildRoleFormSchema>;
export type UpdateGuildFormType = z.infer<typeof updateGuildFormSchema>;
export type AssignRoleMemberFormType = z.infer<typeof assignRoleMembersSchema>;
