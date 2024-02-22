import { useState } from 'react';
import { GuildRole } from '../types';

export const useFilteredRoles = (roles: GuildRole[]) => {
    const [filter, setFilter] = useState('');

    return {
        filteredRoles:
            filter.trim().length === 0
                ? roles
                : roles.filter((r) => r.name.toLowerCase().includes(filter.toLowerCase())),
        filter,
        setFilter,
    };
};
