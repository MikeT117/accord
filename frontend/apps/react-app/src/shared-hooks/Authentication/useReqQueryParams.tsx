import { useLocation } from 'react-router';

export const useReqQueryParams = () => {
    const search = useLocation().search;
    return (() => new URLSearchParams(search))();
};
