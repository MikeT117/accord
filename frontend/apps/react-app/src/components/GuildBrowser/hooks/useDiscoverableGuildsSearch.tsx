import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchQueryParams } from './useSearchQueryParams';

export const useDiscoverableGuildsSearch = () => {
    const { query } = useSearchQueryParams();
    const [filter, setFilter] = useState(query);
    const navigate = useNavigate();

    const initiateSearch = useCallback(() => {
        const queryString = filter.trim().replace(/\W+/g, '+');

        if (queryString.length !== 0) {
            navigate(`/app/public-servers?name=${queryString}&limit=10`);
        } else {
            navigate(`/app/public-servers?limit=10`);
        }
    }, [navigate, filter]);

    return { filter, setFilter, initiateSearch };
};
