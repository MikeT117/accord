import { GuildRole } from '../../../types';

export const isChannelViewable = (
    channelRoles: string[],
    guildMemberRoles: string[],
    guildRoles: GuildRole[],
) => {
    for (const channelRole of channelRoles) {
        for (const guildMemberRole of guildMemberRoles) {
            if (channelRole !== guildMemberRole) {
                continue;
            }

            for (const guildRole of guildRoles) {
                if (guildRole.id !== guildMemberRole || (guildRole.permissions & (1 << 0)) === 0) {
                    continue;
                }

                return true;
            }
        }
    }

    return false;
};
