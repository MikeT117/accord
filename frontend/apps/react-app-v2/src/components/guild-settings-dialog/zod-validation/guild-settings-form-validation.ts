import * as z from "zod/v4-mini";

export const updateGuildFormSchema = z.object({
    name: z
        .string()
        .check(
            z.minLength(1, { error: "Guild names must be loner than 1 character." }),
            z.maxLength(32, { error: "Guild names must be no longer than 32 characters." }),
        ),
    description: z.string().check(z.maxLength(300, { error: "Descriptions must be no longer than 300 characters." })),
    discoverable: z.boolean(),
    guildCategoryId: z.nullable(z.string()),
});

export const updateGuildRoleFormSchema = z.object({
    name: z
        .string()
        .check(
            z.minLength(1, { error: "Role names must be loner than 1 character." }),
            z.maxLength(32, { error: "Role names must be no longer than 32 characters." }),
        ),
    ViewGuildChannel: z.boolean(),
    ManageGuildChannel: z.boolean(),
    CreateChannelMessage: z.boolean(),
    ManageChannelMessage: z.boolean(),
    ManageGuild: z.boolean(),
    GuildAdmin: z.boolean(),
    GuildSuperAdmin: z.boolean(),
    GuildOwner: z.boolean(),
    ViewGuildMember: z.boolean(),
    CreateChannelPin: z.boolean(),
});

export const assignRoleMembersSchema = z.object({
    userIds: z.array(z.uuid(), { message: "You must select at least one user." }),
});
