import * as z from 'zod/v4-mini';
import { guildMemberSchema } from './guild-member-schema';
import { userSchema } from './user-schema';

export const guildMemberUserSchema = z.object({
    guildMember: guildMemberSchema,
    user: userSchema,
});
