import { useMemo } from 'react';
import { GuildRole } from '../../../types';

export const useDefaultRole = (roles: GuildRole[] | undefined) => {
    if (!roles) {
        return;
    }

    return useMemo(() => roles.find((r) => r.name === '@default'), [roles]);
};
