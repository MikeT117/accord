import * as z from "zod/v4-mini";

export const userSchema = z.object({
    id: z.string(),
    username: z.string(),
    displayName: z.string(),
    publicFlags: z.number(),
    avatar: z.pipe(
        z.optional(z.nullable(z.string())),
        z.transform((a) => (!a || a.trim() === "" ? null : a))
    ),
    banner: z.pipe(
        z.optional(z.nullable(z.string())),
        z.transform((a) => (!a || a.trim() === "" ? null : a))
    ),
});

export const userRoleAssociationChangeSchema = z.object({
    roleId: z.string(),
});

export const userUpdatedSchema = z.object({
    displayName: z.string(),
    publicFlags: z.number(),
    avatar: z.pipe(
        z.optional(z.nullable(z.string())),
        z.transform((a) => (!a || a.trim() === "" ? null : a))
    ),
    banner: z.pipe(
        z.optional(z.nullable(z.string())),
        z.transform((a) => (!a || a.trim() === "" ? null : a))
    ),
});
