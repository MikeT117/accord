import * as z from "zod/v4-mini";

export const createGuildChannelFormSchema = z.object({
    name: z.string().check(z.minLength(3)),
    roleIds: z.array(z.string()),
    isPrivate: z.boolean(),
    channelType: z.literal(["GUILD_TEXT_CHANNEL", "GUILD_VOICE_CHANNEL"]),
});
