import { GuildChannel, GuildRole } from '../../../types';
import { isChannelViewable } from './isChannelViewable';
import { sortChannelsWithUnviewableParents } from './sortChannelsWithUnviewableParents';

export const sortChannels = (
    channels: GuildChannel[],
    guildMemberRoles: string[],
    guildRoles: GuildRole[],
) => {
    const parents = [];
    const children = [];
    const orphans = [];

    for (const channel of channels) {
        if (!isChannelViewable(channel.roles, guildMemberRoles, guildRoles)) {
            continue;
        }

        switch (channel.channelType) {
            case 1:
                parents.push(channel);
                break;
            case 0:
            case 4:
                if (channel.parentId) {
                    children.push(channel);
                    break;
                } else {
                    orphans.push(channel);
                    break;
                }
        }
    }
    return sortChannelsWithUnviewableParents(parents, children, orphans);
};
