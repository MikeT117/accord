import * as z from "zod/v4-mini";
import { privateChannelSchema } from "./channel-schema";
import { guildSchema } from "./guild-schema";
import { userSchema } from "./user-schema";
import { relationshipSchema } from "./relationship-schema";

export const initialisationSchema = z.object({
    user: userSchema,
    guilds: z.array(guildSchema),
    privateChannels: z.array(privateChannelSchema),
    roleIds: z.array(z.string()),
    relationships: z.array(relationshipSchema),
});
