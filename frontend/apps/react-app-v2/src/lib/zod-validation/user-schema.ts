import * as z from "zod/v4-mini";

export const userSchema = z.object({
    id: z.string(),
    username: z.string(),
    displayName: z.string(),
    publicFlags: z.number(),
    avatar: z.optional(z.nullable(z.string())),
    banner: z.optional(z.nullable(z.string())),
});

export const userRoleAssociationChangeSchema = z.object({
    roleId: z.string(),
});
