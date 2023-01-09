import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchQueryParams } from './useSearchQueryParams';

export const useDiscoverableGuildsSearch = () => {
  const { query } = useSearchQueryParams();
  const [filter, setFilter] = useState(query ?? '');
  const navigate = useNavigate();

  const initiateSearch = useCallback(() => {
    const queryString = filter.trim().replace(' ', '+');
    if (queryString.length !== 0) {
      navigate(`/app/public-servers?query=${queryString}&offset=0&limit=10`);
    } else {
      navigate(`/app/public-servers?offset=0&limit=10`);
    }
  }, [navigate, filter]);

  return { filter, setFilter, initiateSearch };
};
