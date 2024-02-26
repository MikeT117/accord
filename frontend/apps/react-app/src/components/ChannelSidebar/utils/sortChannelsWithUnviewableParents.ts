import { GuildChannel } from '../../../types';

export const sortChannelsWithUnviewableParents = (
    parents: GuildChannel[],
    children: GuildChannel[],
    orphans: GuildChannel[],
) => {
    for (const [idx, child] of children.entries()) {
        let found = false;
        for (const parent of parents) {
            if (child.parentId === parent.id) {
                found = true;
            }
        }

        if (!found) {
            orphans.push(child);
            children.splice(idx, 1);
        }
    }

    return { children, orphans, parents };
};
