import { useReqQueryParams } from '@/shared-hooks';

export const useSearchQueryParams = () => {
    const params = useReqQueryParams();
    const query = params.get('name');
    const limit = params.get('limit');

    return {
        query: query && query?.trim().length !== 0 ? query.trim() : '',
        limit: limit && limit?.trim().length !== 0 ? parseInt(limit.trim(), 10) : 50,
    };
};
