import { useEffect } from 'react';
import { sessionStore } from '@/shared-stores/sessionStore';
import { useReqQueryParams } from './useReqQueryParams';

export const useExtractTokensFromQueryParams = () => {
    const params = useReqQueryParams();
    const accesstoken = params.get('accesstoken');
    const refreshtoken = params.get('refreshtoken');
    const error = params.get('error');

    useEffect(() => {
        if (!error && accesstoken && refreshtoken) {
            sessionStore.setSession({ accesstoken: `Bearer ${accesstoken}`, refreshtoken });
        }
    }, [params]);

    return error ? error.replace('+', ' ') : null;
};
