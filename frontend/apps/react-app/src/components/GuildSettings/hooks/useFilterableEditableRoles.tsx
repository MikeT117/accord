import { useMemo } from 'react';
import { GuildRole } from '../../../types';

export const useFilterableEditableRoles = (roles: GuildRole[], filter = '') => {
    return useMemo(
        () =>
            roles.filter((r) => {
                if (!!filter || !filter.trim()) {
                    return !['@default', '@owner'].includes(r.name);
                }

                return (
                    !['@default', '@owner'].includes(r.name) &&
                    r.name.toLowerCase().includes(filter.toLowerCase())
                );
            }),
        [roles, filter],
    );
};
